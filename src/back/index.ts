import { readFileSync } from "fs";
import express from "express";
import cors from "cors";
import path from "path";
import type RouteHandler from "./types/RouteHandler";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { Logger } from "./utils/logger";
import { $ } from "bun";
import {
	defaultEditorRuntimeConfig,
	injectEditorRuntimeConfig,
} from "./editorRuntimeConfig";
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

const editorDirectory = path.join(__dirname, "../front-editeur");
const editorIndexPath = path.join(editorDirectory, "out/index.html");
const buildEditor = async () => {
	Logger.debug(
		await $`bun install --frozen-lockfile`.cwd(editorDirectory).text(),
		"editor: install",
	);
	Logger.debug(
		await $`bun run build`.cwd(editorDirectory).text(),
		"editor: build",
	);

	if (process.env.BUILD === "dev") {
		const watcher = Bun.spawn(["bun", "run", "build:watch"], {
			cwd: editorDirectory,
			stdout: "inherit",
			stderr: "inherit",
		});
		watcher.exited.catch((error) =>
			Logger.error(String(error), "editor: watch"),
		);
	}
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
	const { corpAlgo, nomFichier, sourceImport } = req.body;
	const config = defaultEditorRuntimeConfig();

	if (corpAlgo) {
		try {
			config.initialAlgorithm = JSON.parse(corpAlgo);
			if (typeof config.initialAlgorithm === "string") {
				config.initialAlgorithm = JSON.parse(config.initialAlgorithm);
			}
		} catch {
			res.status(400).send("Invalid algorithm JSON.");
			return;
		}
	}

	config.prettifyInitialAlgorithm = sourceImport === "tbr";

	if (typeof nomFichier === "string" && nomFichier.length > 0) {
		config.title = nomFichier;
	}

	const content = injectEditorRuntimeConfig(
		readFileSync(editorIndexPath, "utf8"),
		config,
	);
	res.type("html").send(content);
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
	if (!MailService.shouldBeActive()) {
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
import { MailService } from "./mail/mail.service";
Promise.all([dbConnexion, mailConnexion, buildEditor()])
	.then(async () => {
		// Handling API logs.
		app.use(loggerMiddleware);

		app.use("/api/algos", new AlgosController().router);
		app.use("/api/users", new UsersController().router);

		// Handling errors
		app.use(errorMiddleware);

		// Start server
		app.listen(port, async () => {
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
