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
import { beforeAll } from "bun:test";
import { app } from "../index";
import supertest from "supertest";
import { AppDataSource } from "../db/data-source";

export const request = supertest(app);
export const server = app;

// On attend que l'application soit initialisée avant de lancer les tests.
beforeAll(async () => {
	Logger.log("Waiting for application to be initialized...", "test: setup");
	while (!app.locals.initialized) {
		await Bun.sleep(100);
	}

	Logger.log("Application initialized !", "test: setup");
	app.locals.testSetupInit = true;
	await clearAllTables();
	app.locals.testSetupDone = true;
});

import { AlgosTests } from "./algos.test";
import { UsersTests } from "./users.test";

// Enregistre les suites et leurs hooks au chargement du module. Bun interdit
// d'ajouter des hooks depuis un test ou un hook déjà en cours d'exécution.
UsersTests();
AlgosTests();

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
