import express from "express";
import path from "path";
import type RouteHandler from "./types/RouteHandler";

// RouteHandlers
import AssetsDynamiques from "./assetsDynamiques";
import getBibliothèque from "./getBibliotheques";
import { iconHandler } from "./getBibliotheques";

const app = express();
const port = 3000;

AssetsDynamiques.forEach((asset: RouteHandler) => {
	app.get(`/edit/assetsDynamiques${asset.route}`, asset.callback);
});

app.get(getBibliothèque.route, getBibliothèque.callback);

app.get(iconHandler.route, iconHandler.callback);

app.use("/edit", express.static(path.join(__dirname, "../front-editeur/src")));

// Init database connection
import { AppDataSource } from "./db/data-source";

AppDataSource.initialize().then(async () => {
	console.log("Database connection initialized");

	// Start server
	app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});
}).catch((err) => {
	console.error("Error while initializing database connection: \n", err);
	process.exit(1);
});
