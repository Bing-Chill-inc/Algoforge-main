import { UserRegisterDTO } from "../api/users/users.dto";
import { Logger } from "../utils/logger";
import { server, request } from "./setup";

import { describe, expect, test } from "bun:test";

describe("Users: new user", () => {
	describe("register", () => {
		test("POST /api/users/register -> erreur: Il manque des données.", async () => {
			const response = await request.post("/api/users/register").send({});
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"message",
				"Il manque des données",
			);
		});

		test("POST /api/users/register -> nouveau utilisateur.", async () => {
			const payload = new UserRegisterDTO();
			payload.email = "test@toxykaubleu.fr";
			payload.password = "test";
			payload.pseudo = "Test de ToxykAuBleu";

			const response = await request
				.post("/api/users/register")
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("message", "Utilisateur créé");
		});
		test.todo("POST /api/users/register -> erreur: Email déjà utilisé.");

		// TODO: Go dans users.controller.ts réaliser le tag avec FIXME.
		test.todo(
			"GET /api/users/1 -> erreur: <insert error from #users.controller.ts",
		);
	});

	describe("login", () => {
		test.todo("POST /api/users/login -> erreur: Il manque des données.");
		test.todo("POST /api/users/login -> erreur: Utilisateur introuvable.");
		test.todo("POST /api/users/login -> erreur: Mot de passe incorrect.");
		test.todo("POST /api/users/login -> Connexion réussie.");

		test.todo("GET /api/users/1 -> Utilisateur trouvé.");
	});

	describe("logout", () => {
		test.todo("GET /api/users/logout -> erreur: Token introuvable.");
		test.todo("GET /api/users/logout -> Déconnexion réussie.");
	});
});
