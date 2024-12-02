import express from "express";
import cors from "cors";
import path from "path";
import type RouteHandler from "./types/RouteHandler";
import { Logger } from "./utils/logger";
Logger.filePath = `../../logs/`;
Logger.log("Starting application...", "main");

// RouteHandlers
import AssetsDynamiques from "./assetsDynamiques";
import getBibliothèque from "./getBibliotheques";
import { iconHandler } from "./getBibliotheques";

const app = express();
const port = 3000;
app.use(cors());

AssetsDynamiques.forEach((asset: RouteHandler) => {
	app.get(`/edit/assetsDynamiques${asset.route}`, asset.callback);
});

app.get(getBibliothèque.route, getBibliothèque.callback);

app.get(iconHandler.route, iconHandler.callback);

app.use("/edit", express.static(path.join(__dirname, "/../front-editeur/src")));
app.use("/cloud", express.static(path.join(__dirname, "/../front-cloud/dist")));

import { AppDataSource } from "./db/data-source";
import { Transporter } from "./mail/transporter";

// Init database connection
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
// Init mail connection
const mailConnexion = new Promise((resolve, reject) => {
	Logger.log("Attempting to initialize mail connection...", "main: mail");
	Transporter.verify()
		.then(() => {
			Logger.log("Mail connected.", "main: mail");
			resolve(null);
		})
		.catch((err) => {
			reject(err);
		});
});

Promise.all([dbConnexion, mailConnexion])
	.then(() => {
		app.listen(port, () => {
			Logger.log(`Server is running on http://localhost:${port}`, "main");
		});
	})
	.catch((err) => {
		Logger.error(
			`Error while initialising application: \n${err.stack}`,
			"main",
		);
		process.exit(1);
	});
