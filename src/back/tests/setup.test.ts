import { Logger } from "../utils/logger";
/**
 * Ce fichier permet d'initialiser l'environnement de test
 * de l'application avant de démarrer les tests.
 */

// Vérification du mode de l'application.
if (process.env.BUILD !== "test") {
	Logger.error("Le mode de l'application doit être 'test'.", "test: setup");
	Logger.warn(
		"ATTENTION: ceci supprime toutes les données de la base de données.",
		"test: setup",
	);
	process.exit(1);
}

// Démarrage des tests.
import { afterAll, beforeAll } from "bun:test";
import { app } from "../index";
import supertest from "supertest";
import { AppDataSource } from "../db/data-source";

export const request = supertest(app);
export const server = app;

// On attend que l'application soit initialisée avant de lancer les tests.
beforeAll(async (done) => {
	Logger.log("Waiting for application to be initialized...", "test: setup");
	const interval = setInterval(async () => {
		if (app.locals.initialized && !app.locals.testSetupInit) {
			Logger.log("Application initialized !", "test: setup");
			app.locals.testSetupInit = true;
			clearInterval(interval);
			await clearAllTables();
			app.locals.testSetupDone = true;
			done();
		}
	}, 1000);
});

import { AlgosTests } from "./algos.test";
import { UsersTests } from "./users.test";

// Lancement des tests unitaires.
afterAll(async (done) => {
	await UsersTests();
	await AlgosTests();
	done;
});

import { Utilisateur } from "../db/schemas/Utilisateur.schema";
import { Token } from "../db/schemas/Token.schema";
import { Algorithme } from "../db/schemas/Algorithme.schema";
import { PermAlgorithme } from "../db/schemas/PermAlgorithme.schema";
import { Dossier } from "../db/schemas/Dossier.schema";
import { PermDossier } from "../db/schemas/PermDossier.schema";
// Suppression de toutes les données de la base de données.
async function clearAllTables() {
	Logger.log("Cleaning database...", "test: setup");
	// Récupération de toutes les entités de l'application.
	const entities = [
		PermAlgorithme,
		PermDossier,
		Dossier,
		Algorithme,
		Token,
		Utilisateur,
	];

	for (const entity of entities) {
		const repository = AppDataSource.getRepository(entity.name);
		Logger.debug(
			`Clearing table: ⏳ ${repository.metadata.tableName}`,
			"test: setup",
			5,
		);
		await AppDataSource.query(
			`DELETE FROM ${repository.metadata.tableName}`,
		);
		Logger.debug(
			`Clearing table: 🧹 ${repository.metadata.tableName} `,
			"test: setup",
			5,
		);
	}

	Logger.log("Cleaning done !", "test: setup");
}
