import { Logger } from "../utils/logger";
/**
 * Ce fichier permet d'initialiser l'environnement de test
 * de l'application avant de démarrer les tests.
 */

// Vérification du mode de l'application.
if (process.env.BUILD !== "dev") {
	Logger.error("Le mode de l'application doit être 'dev'.", "test: setup");
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

import { Utilisateur } from "../db/schemas/Utilisateur.schema";
import { Token } from "../db/schemas/Token.schema";
import { Algorithme } from "../db/schemas/Algorithme.schema";
import { PermAlgorithme } from "../db/schemas/PermAlgorithme.schema";
import { Dossier } from "../db/schemas/Dossier.schema";
import { PermDossier } from "../db/schemas/PermDossier.schema";
// Suppression de toutes les données de la base de données.
async function clearAllTables() {
	Logger.debug("Cleaning database...", "test: setup", 2);
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

	Logger.debug("Cleaning done !", "test: setup", 2);
}
