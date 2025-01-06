import { UserLoginDTO, UserRegisterDTO } from "../api/users/users.dto";
import { Logger } from "../utils/logger";
import { server, request } from "./setup";

import { describe, expect, test } from "bun:test";

export const usersTest = () => {
	describe("Users: new user", () => {
		let token: string = "";

		describe("register", () => {
			test("POST /api/users/register -> erreur: Il manque des données.", async () => {
				const response = await request
					.post("/api/users/register")
					.send({});
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(400);
				expect(response.body).toHaveProperty(
					"message",
					"Il manque des données",
				);
			});

			test("POST /api/users/register -> erreur: Email invalide.", async () => {
				const payload = new UserRegisterDTO();
				payload.email = "test@@";
				payload.password = "testtest";
				payload.pseudo = "Test de ToxykAuBleu";

				const response = await request
					.post("/api/users/register")
					.send(payload);
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(400);
				expect(response.body).toHaveProperty(
					"message",
					"Données invalides",
				);
				expect(response.body.data[0]).toHaveProperty(
					"property",
					"email",
				);
			});

			test("POST /api/users/register -> erreur: Mot de passe trop court.", async () => {
				const payload = new UserRegisterDTO();
				payload.email = "test@toxykaubleu.fr";
				payload.password = "test";
				payload.pseudo = "Test de ToxykAuBleu";

				const response = await request
					.post("/api/users/register")
					.send(payload);
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(400);
				expect(response.body).toHaveProperty(
					"message",
					"Données invalides",
				);
				expect(response.body.data[0]).toHaveProperty(
					"property",
					"password",
				);
			});

			test("POST /api/users/register -> nouveau utilisateur.", async () => {
				const payload = new UserRegisterDTO();
				payload.email = "test@toxykaubleu.fr";
				payload.password = "testtest";
				payload.pseudo = "Test de ToxykAuBleu";

				const response = await request
					.post("/api/users/register")
					.send(payload);
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(201);
				expect(response.body).toHaveProperty(
					"message",
					"Utilisateur créé",
				);
			});
			test("POST /api/users/register -> erreur: Email déjà utilisé.", async () => {
				const payload = new UserRegisterDTO();
				payload.email = "test@toxykaubleu.fr";
				payload.password = "testtest";
				payload.pseudo = "Test de ToxykAuBleu";

				const response = await request
					.post("/api/users/register")
					.send(payload);
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(409);
				expect(response.body).toHaveProperty(
					"message",
					"Email déjà utilisé",
				);
			});

			// L'utilisateur doit confirmer son email pour pouvoir se connecter.
			test.todo(
				"GET /api/users/confirm/:token -> erreur: Token invalide.",
			);
			test.todo(
				"GET /api/users/confirm/:token -> erreur: Utilisateur introuvable ou déjà vérifié.",
			);
			test.todo(
				"GET /api/users/confirm/:token -> Inscription confirmée.",
			);

			// L'utilisateur n'est toujours pas connecté après son inscription.
			test("GET /api/users/1 -> erreur: Token invalide.", async () => {
				const response = await request.get("/api/users/1");
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(401);
				expect(response.body).toHaveProperty(
					"message",
					"Token invalide",
				);
			});
		});

		describe("login", () => {
			test("POST /api/users/login -> erreur: Il manque des données.", async () => {
				const response = await request
					.post("/api/users/login")
					.send({});
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(400);
				expect(response.body).toHaveProperty(
					"message",
					"Il manque des données",
				);
			});
			test("POST /api/users/login -> erreur: Utilisateur introuvable.", async () => {
				const payload = new UserLoginDTO();
				payload.email = "test@example.com";
				payload.password = "testtest";

				const response = await request
					.post("/api/users/login")
					.send(payload);
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(404);
				expect(response.body).toHaveProperty(
					"message",
					"Utilisateur introuvable",
				);
			});
			test("POST /api/users/login -> erreur: Mot de passe incorrect.", async () => {
				const payload = new UserLoginDTO();
				payload.email = "test@toxykaubleu.fr";
				payload.password = "wrong";

				const response = await request
					.post("/api/users/login")
					.send(payload);
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(401);
				expect(response.body).toHaveProperty(
					"message",
					"Mot de passe incorrect",
				);
			});
			test("POST /api/users/login -> Connexion réussie.", async () => {
				const payload = new UserLoginDTO();
				payload.email = "test@toxykaubleu.fr";
				payload.password = "testtest";

				const response = await request
					.post("/api/users/login")
					.send(payload);
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(200);
				expect(response.body).toHaveProperty(
					"message",
					"Connexion réussie",
				);

				// Récupération du token pour les tests suivants.
				token = response.body.data.token;
			});

			// FIXME: Actuellement, le token n'est pas stocké dans la variable `token`.
			// Il faut donc que le test précedent stock la valeur du token dans la variable `token`.
			// => implémentation de la fonctionnalité de stockage du token.
			test("GET /api/users/1 -> Utilisateur trouvé.", async () => {
				const response = await request
					.get("/api/users/1")
					.auth(token, { type: "bearer" });
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(200);
				expect(response.body).toHaveProperty(
					"message",
					"Utilisateur trouvé",
				);
			});

			test.todo("PUT /api/users/40 -> erreur: Utilisateur introuvable.");
			test.todo("PUT /api/users/1 -> erreur: Mot de passe incorrect.");
			test.todo("PUT /api/users/1 -> Pseudonyme modifié.");
			test.todo("PUT /api/users/1 -> Mot de passe modifié.");
			test.todo("PUT /api/users/1 -> Email modifié.");
		});

		describe("logout", () => {
			test("GET /api/users/logout -> erreur: Token introuvable.", async () => {
				const response = await request.get("/api/users/logout");
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(404);
				expect(response.body).toHaveProperty(
					"message",
					"Token introuvable",
				);
			});
			// FIXME: Pareil que pour le test /GET /api/users/1 -> Utilisateur trouvé.
			test("GET /api/users/logout -> Déconnexion réussie.", async () => {
				const response = await request
					.get("/api/users/logout")
					.auth(token, { type: "bearer" });
				Logger.debug(JSON.stringify(response.body), "test: users", 5);
				expect(response.status).toBe(200);
				expect(response.body).toHaveProperty(
					"message",
					"Déconnexion réussie",
				);
			});
		});

		describe("recover", () => {
			test.todo("POST /api/users/recover -> erreur: Email introuvable.");
			test.todo("POST /api/users/recover -> Mail de récupération envoyé");
		});
	});
};
