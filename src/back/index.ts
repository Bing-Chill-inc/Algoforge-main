import { readFileSync, watch } from "fs";
import express from "express";
import cors from "cors";
import path from "path";
import type RouteHandler from "./types/RouteHandler";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { Logger } from "./utils/logger";
import { $ } from "bun";
Logger.filePath = `../../logs/`;
Logger.log("Starting application...", "main");

// RouteHandlers
import AssetsDynamiques from "./assetsDynamiques";
import getBibliothèque from "./getBibliotheques";
import { iconHandler } from "./getBibliotheques";

export const app = express();
const port = process.env.PORT || 5205;
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

AssetsDynamiques.forEach((asset: RouteHandler) => {
	app.get(`/edit/assetsDynamiques${asset.route}`, asset.callback);
});

app.get(getBibliothèque.route, getBibliothèque.callback);

app.get(iconHandler.route, iconHandler.callback);

// Préparation du bundle de l'éditeur - SmeltJS.
const SmeltJS = async () => {

	Logger.debug(await $`bun i`.cwd(`../front-editeur`).text(), "smeltjs: install");

	// Si le contenu du dossier ../front-editeur change, il faut relancer la commande.

	watch(
		path.join(__dirname, "/../front-editeur/src"),
		{ recursive: true },
		async () => {
			Logger.debug(await $`bun SmeltJS.ts`.cwd(`../front-editeur`).text(), "smeltjs: build");
		},
	);

	Logger.debug(await $`bun SmeltJS.ts`.cwd(`../front-editeur`).text(), "smeltjs: build");
};

app.use("/edit", express.static(path.join(__dirname, "/../front-editeur/out")));
app.use("/cloud", express.static(path.join(__dirname, "/../front-cloud/dist")));

app.get("/", (_, res) => {
	res.redirect("/edit");
});

app.get("/favicon.ico", (_, res) => {
	res.sendFile(path.join(__dirname, "favicon.ico"));
});

// Ouverture de algorithme en paramètre.
app.post("/edit", (req, res) => {
	const { corpAlgo, nomFichier } = req.body;
	let content = readFileSync(
		path.join(__dirname, "/../front-editeur/out/index.html"),
		"utf8",
	);

	// Chargement du contenu de l'algorithme.
	if (corpAlgo) {
		let algoContent = JSON.parse(corpAlgo);
		if (typeof algoContent === "string") {
			algoContent = JSON.parse(algoContent);
		}
		algoContent = JSON.stringify(algoContent);
		content = content.replace(
			"</html>",
			`<script>editeur._espacePrincipal.chargerDepuisJSON(${algoContent});</script></html>`,
		);
	}

	// Chargement du titre de l'algorithme.
	if (nomFichier) {
		content = content.replace(
			"</html>",
			`<script>titreAlgo.innerText = '${nomFichier}';
			document.title = 'Algoforge - ${nomFichier}';</script></html>`,
		);
	}

	res.send(content);
});

import { AppDataSource } from "./db/data-source";
import { Transporter } from "./mail/transporter";

// Init database connection
const dbConnexion = new Promise((resolve, reject) => {
	const retryTimes = parseInt(process.env.RETRY_MANY_TIMES || "3", 10);
	let attempts = 1;

	const connectWithRetry = () => {
		Logger.log(
			`Attempting to initialize database connection... (Attempt ${attempts})`,
			"main: db",
		);
		AppDataSource.initialize()
			.then(() => {
				Logger.log("Database connected.", "main: db");
				resolve(null);
			})
			.catch(async (err) => {
				attempts++;
				Logger.error(
					`Error while connecting to database: \n${err}`,
					"main: db",
				);
				if (attempts <= retryTimes) {
					Logger.log(
						`Retrying to connect to database... (${attempts}/${retryTimes})`,
						"main: db",
					);
					setTimeout(connectWithRetry, 1000);
				} else {
					reject(err);
				}
			});
	};

	connectWithRetry();
});
// Init mail connection
const mailConnexion = new Promise((resolve, reject) => {
	if (process.env.MAIL_ENABLED !== "true") {
		Logger.warn(
			"Mail service is not active. No mail will be sent.",
			"mail: service",
		);
		resolve(null);
		return;
	}
	const retryTimes = parseInt(process.env.RETRY_MANY_TIMES || "3", 10);
	let attempts = 1;

	const connectWithRetry = () => {
		Logger.log(
			`Attempting to initialize mail connection... (Attempt ${attempts})`,
			"main: mail",
		);
		Transporter.verify()
			.then(() => {
				Logger.log("Mail connected.", "main: mail");
				resolve(null);
			})
			.catch((err) => {
				attempts++;
				Logger.error(
					`Error while connecting to mail: \n${err}`,
					"main: mail",
				);
				if (attempts <= retryTimes) {
					Logger.log(
						`Retrying to connect to mail... (${attempts}/${retryTimes})`,
						"main: mail",
					);
					setTimeout(connectWithRetry, 1000);
				} else {
					reject(err);
				}
			});
	};

	connectWithRetry();
});

// Starting application
import { AlgosController } from "./api/algos/algos.controller";
import { UsersController } from "./api/users/users.controller";
Promise.all([dbConnexion, mailConnexion, SmeltJS()])
	.then(async () => {
		// Handling API logs.
		app.use(loggerMiddleware);

		app.use("/api/algos", new AlgosController().router);
		app.use("/api/users", new UsersController().router);

		// Handling errors
		app.use(errorMiddleware);

		app.listen(port, () => {
			Logger.log(`Server is running on http://localhost:${port}`, "main");

			// On indique que l'application est initialisée.
			// Cela permet de lancer les tests après que l'application soit prête.
			app.locals.initialized = true;
		});
	})
	.catch((err) => {
		Logger.error(
			`Error while initialising application: \n${JSON.stringify(err)}`,
			"main",
		);
		process.exit(1);
	});
