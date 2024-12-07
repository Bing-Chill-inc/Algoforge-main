// TODO: Ajouter tous les tests pour les routes de l'API des algorithmes.
// Il faudra intégrer des tests intermédiaires, plus précisément avec des vérifications des données envoyées.

import { Logger } from "../utils/logger";
Logger.log("Waiting for application to be initialized...", "test: algos");

import { beforeAll, expect, test } from "bun:test";
import { app } from "../index";
import supertest from "supertest";

const request = supertest(app);

// On attend que l'application soit initialisée avant de lancer les tests.
beforeAll((done) => {
	const interval = setInterval(() => {
		if (app.locals.initialized) {
			clearInterval(interval);
			done();
		}
	}, 100);
});

test("GET /api/algos/byUserId/:id -> L'utilisateur n'a aucun algorithme.", async () => {
	const response = await request.get("/api/algos/byUserId/1");
	expect(response.status).toBe(404);
	expect(response.body).toHaveProperty("message");
});

test.todo("GET /api/algos/:id -> L'algorithme n'existe pas.", async () => {});
test.todo(
	"POST /api/algos/ -> Création d'un nouveau algorithme. ",
	async () => {},
);
test.todo(
	"PUT /api/algos/:id -> Modification d'un algorithme. ",
	async () => {},
);
test.todo(
	"DELETE /api/algos/:id -> Suppression d'un algorithme. ",
	async () => {},
);
