/**
 * Ce fichier permet d'initialiser l'environnement de test
 * de l'application avant de démarrer les tests.
 */

// Vérification du mode de l'application.
if (process.env.BUILD !== "dev") {
	throw new Error(
		"Le mode de l'application doit être 'dev'. \nATTENTION: ceci supprime toutes les données de la base de données.",
	);
}

// Démarrage des tests.
import { afterAll, beforeAll } from "bun:test";
import { app } from "../index";
import supertest from "supertest";
import { AppDataSource } from "../db/data-source";
import { Logger } from "../utils/logger";

export const request = supertest(app);
export const server = app;

// On attend que l'application soit initialisée avant de lancer les tests.
beforeAll((done) => {
	Logger.log("Waiting for application to be initialized...", "test: setup");
	const interval = setInterval(async () => {
		if (app.locals.initialized) {
			clearInterval(interval);
			await clearAllTables();
			done();
		}
	}, 100);
});

// Suppression de toutes les données de la base de données.
async function clearAllTables() {
	Logger.debug("Cleaning database...", "test: setup", 2);
	// Récupération de toutes les entités de l'application.
	const entities = AppDataSource.entityMetadatas;

	for (const entity of entities) {
		const repository = AppDataSource.getRepository(entity.name);
		Logger.debug(
			`Clearing table: ⏳ ${entity.tableName}`,
			"test: setup",
			5,
		);
		await repository.clear();
		Logger.debug(
			`Clearing table: 🧹 ${entity.tableName} `,
			"test: setup",
			5,
		);
	}

	Logger.debug("Cleaning done !", "test: setup", 2);
}
