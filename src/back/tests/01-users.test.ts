import {
	UserLoginDTO,
	UserRegisterDTO,
	UserUpdateDTO,
} from "../api/users/users.dto";
import { Logger } from "../utils/logger";
import { createMailToken } from "../utils/mailConfirmToken";
import { server, request } from "./setup";

import { afterAll, describe, expect, test } from "bun:test";
import { UserSet } from "./user.set";

describe("Users: new user", () => {
	// Création de 2 utilisateurs pour les tests suivants.
	afterAll(async () => {
		Logger.log("Generating 2 other users...", "test: users");
		const payload1 = new UserRegisterDTO();
		payload1.email = UserSet.test1.email;
		payload1.pseudo = UserSet.test1.pseudo;
		payload1.password = UserSet.test1.password;

		const payload2 = new UserRegisterDTO();
		payload2.email = UserSet.test2.email;
		payload2.pseudo = UserSet.test2.pseudo;
		payload2.password = UserSet.test2.password;
		for (const payload of [payload1, payload2]) {
			const response = await request
				.post("/api/users/register")
				.send(payload);
			const mailToken = await createMailToken(response.body.data.id);
			const mailConfirmResponse = await request.get(
				`/api/users/confirm/${mailToken}`,
			);
			Logger.debug(
				JSON.stringify(mailConfirmResponse.body),
				"test: users",
				5,
			);
		}

		// Vérification des emails.
		Logger.log("Generated !", "test: users");
	});

	let token: string = "";
	let confirmToken: string = "";

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

		test("POST /api/users/register -> erreur: Email invalide.", async () => {
			const payload = new UserRegisterDTO();
			payload.email = "test@@";
			payload.password = UserSet.example.password;
			payload.pseudo = UserSet.example.pseudo;

			const response = await request
				.post("/api/users/register")
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"message",
				"Données invalides",
			);
			expect(response.body.data[0]).toHaveProperty("property", "email");
		});

		test("POST /api/users/register -> erreur: Mot de passe trop court.", async () => {
			const payload = new UserRegisterDTO();
			payload.email = UserSet.example.email;
			payload.password = "test";
			payload.pseudo = UserSet.example.pseudo;

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
			payload.email = UserSet.example.email;
			payload.password = UserSet.example.password;
			payload.pseudo = UserSet.example.pseudo;

			const response = await request
				.post("/api/users/register")
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("message", "Utilisateur créé");

			// Récupération du token de confirmation ("envoyé par mail") pour les tests suivants.
			confirmToken = await createMailToken(response.body.data.id);
			Logger.debug(
				`Token de confirmation: ${confirmToken}`,
				"test: users",
				5,
			);
		});
		test("POST /api/users/register -> erreur: Email déjà utilisé.", async () => {
			const payload = new UserRegisterDTO();
			payload.email = UserSet.example.email;
			payload.password = UserSet.example.password;
			payload.pseudo = UserSet.example.pseudo;

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
		test("GET /api/users/confirm/:token -> erreur: Token invalide. (wrong)", async () => {
			const response = await request.get("/api/users/confirm/wrong");
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("message", "Token invalide");
		});
		test("GET /api/users/confirm/:token -> erreur: Token invalide. (Ex: base64)", async () => {
			const response = await request.get(
				"/api/users/confirm/MV9VRlQxNzM2MjY0OTg5ODgx",
			);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("message", "Token invalide");
		});
		test("GET /api/users/confirm/:token -> Inscription confirmée.", async () => {
			const response = await request.get(
				`/api/users/confirm/${confirmToken}`,
			);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty(
				"message",
				"Inscription confirmée",
			);
		});

		// L'utilisateur n'est toujours pas connecté après son inscription.
		test("GET /api/users/1 -> erreur: Token manquant.", async () => {
			const response = await request.get("/api/users/1");
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("message", "Token manquant");
		});
		test("GET /api/users/1 -> erreur: Token invalide.", async () => {
			const response = await request
				.get("/api/users/1")
				.auth("wrong", { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty("message", "Token invalide");
		});
	});

	describe("login", () => {
		test("POST /api/users/login -> erreur: Il manque des données.", async () => {
			const response = await request.post("/api/users/login").send({});
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
			payload.password = UserSet.example.password;

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
			payload.email = UserSet.example.email;
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
			payload.email = UserSet.example.email;
			payload.password = UserSet.example.password;

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
			token = response.body.data.tokens[0].token;
		});

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

		test("PUT /api/users/40 -> erreur: Permission refusée.", async () => {
			const response = await request
				.put("/api/users/40")
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(403);
			expect(response.body).toHaveProperty(
				"message",
				"Permission refusée",
			);
		});
		test("PUT /api/users/1 -> erreur: Mot de passe incorrect.", async () => {
			const payload = new UserUpdateDTO();
			payload.pseudo = "Nouveau pseudo !";
			payload.currentPassword = "wrong";

			const response = await request
				.put("/api/users/1")
				.auth(token, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty(
				"message",
				"Mot de passe incorrect",
			);
		});
		test("PUT /api/users/1 -> Pseudonyme modifié.", async () => {
			const payload = new UserUpdateDTO();
			payload.pseudo = UserSet.example.newPseudo;
			payload.currentPassword = UserSet.example.password;

			const response = await request
				.put("/api/users/1")
				.auth(token, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty(
				"message",
				"Utilisateur mis à jour",
			);
		});
		test("PUT /api/users/1 -> Mot de passe modifié.", async () => {
			const payload = new UserUpdateDTO();
			payload.currentPassword = UserSet.example.password;
			payload.newPassword = UserSet.example.newPassword;

			const response = await request
				.put("/api/users/1")
				.auth(token, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty(
				"message",
				"Utilisateur mis à jour",
			);
		});
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
