import { UserLoginDTO } from "../api/users/users.dto";
import { Logger } from "../utils/logger";
import { server, request } from "./setup";

import { beforeAll, describe, expect, test } from "bun:test";
import { UserSet } from "./user.set";

describe("Users: delete user", () => {
	let tokensUser: string[] = [];

	// Connexion de l'utilisateur pour les tests suivants.
	beforeAll(async () => {
		Logger.log("Connecting with 2 users...", "test: users");
		const payload1 = new UserLoginDTO();
		payload1.email = UserSet.test1.email;
		payload1.password = UserSet.test1.password;

		const payload2 = new UserLoginDTO();
		payload2.email = UserSet.test2.email;
		payload2.password = UserSet.test2.password;
		for (const payload of [payload1, payload2]) {
			let response = await request.post("/api/users/login").send(payload);
			tokensUser.push(response.headers.authorization);
		}
		Logger.log("Logged in !", "test: users");
	});

	test("DELETE /api/users/1 -> erreur: Token invalide.", async () => {
		const response = await request
			.delete("/api/users/1")
			.auth("wrong", { type: "bearer" });
		Logger.debug(JSON.stringify(response.body), "test: users", 5);
		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty("message", "Token invalide");
	});

	test("DELETE /api/users/2 -> erreur: Utilisateur introuvable.", async () => {
		const response = await request
			.delete("/api/users/5")
			.auth(tokensUser[1], { type: "bearer" });
		Logger.debug(JSON.stringify(response.body), "test: users", 5);
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty(
			"message",
			"Utilisateur introuvable",
		);
	});

	test("DELETE /api/users/2 -> erreur: Permission refusée. (Connecté: User (ID:3))", async () => {
		const response = await request
			.delete("/api/users/2")
			.auth(tokensUser[1], { type: "bearer" });
		Logger.debug(JSON.stringify(response.body), "test: users", 5);
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty("message", "Permission refusée");
	});

	test("DELETE /api/users/2 -> Utilisateur supprimé.", async () => {
		const response = await request
			.delete("/api/users/2")
			.auth(tokensUser[0], { type: "bearer" });
		Logger.debug(JSON.stringify(response.body), "test: users", 5);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("message", "Utilisateur supprimé");
	});
});
