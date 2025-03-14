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
	console.log(await $`bun i`.cwd(`../front-editeur`).text());

	// Si le contenu du dossier ../front-editeur change, il faut relancer la commande.

	watch(
		path.join(__dirname, "/../front-editeur/src"),
		{ recursive: true },
		async () => {
			console.log(await $`bun SmeltJS.ts`.cwd(`../front-editeur`).text());
		},
	);

	console.log(await $`bun SmeltJS.ts`.cwd(`../front-editeur`).text());
};

SmeltJS();

app.use("/edit", express.static(path.join(__dirname, "/../front-editeur/out")));
app.use("/cloud", express.static(path.join(__dirname, "/../front-cloud/dist")));

app.get("/", (_, res) => {
	res.redirect("/edit");
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

// Init database connection
import { AppDataSource } from "./db/data-source";
const dbConnexion = new Promise((resolve, reject) => {
	Logger.log("Attempting to initialize database connection...", "main: db");
	AppDataSource.initialize()
		.then(() => {
			Logger.log("Database connected.", "main: db");
			resolve(null);
		})
		.catch((err) => {
			reject(err);
		});
});

// Starting application
import { AlgosController } from "./api/algos/algos.controller";
import { UsersController } from "./api/users/users.controller";
Promise.all([dbConnexion])
	.then(async () => {
		// Handling API logs.
		app.use(loggerMiddleware);

		app.use("/api/algos", new AlgosController().router);
		app.use("/api/users", new UsersController().router);

		// Handling errors
		app.use(errorMiddleware);

		// Start server
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
