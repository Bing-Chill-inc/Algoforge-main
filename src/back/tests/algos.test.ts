// TODO: Ajouter tous les tests pour les routes de l'API des algorithmes.
// Il faudra intégrer des tests intermédiaires, plus précisément avec des vérifications des données envoyées.
import { Logger } from "../utils/logger";
import { server, request } from "./setup";

import { describe, expect, test } from "bun:test";

describe("Algos: empty database", () => {
	test("GET /api/algos/byUserId/:id -> Aucun algorithme trouvé.", async () => {
		const response = await request.get("/api/algos/byUserId/1");
		Logger.debug(JSON.stringify(response.body), "test: algos", 5);
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty("message");
	});

	test("GET /api/algos/:id -> Algorithme non trouvé.", async () => {
		const response = await request.get("/api/algos/1");
		Logger.debug(JSON.stringify(response.body), "test: algos", 5);
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty("message");
	});

	test("POST /api/algos/ -> Données manquantes.", async () => {
		const response = await request.post("/api/algos").send({});
		Logger.debug(JSON.stringify(response.body), "test: algos", 5);
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
	});

	test("PUT /api/algos/:id -> Données manquantes.", async () => {
		const response = await request.put("/api/algos/1").send({});
		Logger.debug(JSON.stringify(response.body), "test: algos", 5);
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
	});

	test("DELETE /api/algos/:id -> Données manquantes.", async () => {
		const response = await request.delete("/api/algos/1");
		Logger.debug(JSON.stringify(response.body), "test: algos", 5);
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty("message");
	});
});
