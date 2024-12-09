import express from "express";
import cors from "cors";
import path from "path";
import type RouteHandler from "./types/RouteHandler";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { Logger } from "./utils/logger";
Logger.filePath = `../../logs/`;
Logger.log("Starting application...", "main");

// RouteHandlers
import AssetsDynamiques from "./assetsDynamiques";
import getBibliothèque from "./getBibliotheques";
import { iconHandler } from "./getBibliotheques";

export const app = express();
const port = process.env.PORT || 5205;
app.use(cors());

AssetsDynamiques.forEach((asset: RouteHandler) => {
	app.get(`/edit/assetsDynamiques${asset.route}`, asset.callback);
});

app.get(getBibliothèque.route, getBibliothèque.callback);

app.get(iconHandler.route, iconHandler.callback);

app.use("/edit", express.static(path.join(__dirname, "/../front-editeur/src")));
app.use("/cloud", express.static(path.join(__dirname, "/../front-cloud/dist")));

app.get("/", (_, res) => {
	res.redirect("/edit");
});

// Init database connection
import { AppDataSource } from "./db/data-source";
import { AlgosController } from "./api/algos/algos.controller";
import { UsersController } from "./api/users/users.controller";

Logger.log("Attempting to initialize database connection...", "main");
AppDataSource.initialize()
	.then(async () => {
		Logger.log("Database connection initialized", "main");
		// Handling API logs.
		app.use(loggerMiddleware);

		app.use("/api/algos", new AlgosController().router);
		app.use("/api/users", new UsersController().router);

		// Handling errors
		app.use(errorMiddleware);

		// Start server
		app.listen(port, () => {
			Logger.log(`Server is running on http://localhost:${port}`, "main");
		});

		// On indique que l'application est initialisée.
		// Cela permet de lancer les tests après que l'application soit prête.
		app.locals.initialized = true;
	})
	.catch((err) => {
		Logger.error(
			`Error while initializing database connection: \n${err}`,
			"main",
		);
		process.exit(1);
	});
