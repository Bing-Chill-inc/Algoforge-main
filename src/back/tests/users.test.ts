import { AppDataSource } from "../db/data-source";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";
import { Logger } from "../utils/logger";
import { server, request } from "./setup.test";

import { beforeAll, describe, expect, test } from "bun:test";
import { UserSet } from "./user.set";
import { hashString } from "../utils/hash";
import {
	BadRequestRes,
	CreatedRes,
	ForbiddenRes,
	NotFoundRes,
	OkRes,
	UnauthorizedRes,
} from "../types/response.entity";
import { Responses } from "../constants/responses.const";
import {
	UserLoginDTO,
	UserRegisterDTO,
	UserUpdateDTO,
} from "../api/users/users.dto";
import { createMailToken } from "../utils/mailConfirmToken";
import { mocked } from "../mail/transporter";
import { Theme } from "../types/theme.enum";

const utilisateursRepository = AppDataSource.getRepository(Utilisateur);

export const UsersTests = async () => {
	beforeAll(async (done) => {
		const interval = setInterval(async () => {
			if (server.locals.testSetupDone) {
				clearInterval(interval);

				Logger.log("Creating test users...", "test: users");
				for (const user of [
					UserSet.unitTestUser1,
					UserSet.unitTestUser2,
				]) {
					const u = new Utilisateur();
					u.id = user.id;
					u.adresseMail = user.email;
					u.mdpHash = hashString(user.password);
					u.pseudo = user.pseudo;
					u.dateInscription = new Date().getTime();
					u.isVerified = true;
					await utilisateursRepository.save(u);
				}
				Logger.log("Test users created.", "test: users");

				done();
			}
		}, 100);
	});

	let confirmToken: string = "";
	let exampleToken: string = "";

	describe("Users: POST /api/users/register", () => {
		test("erreur: Il manque des données", async () => {
			const response = await request.post("/api/users/register").send({});
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.General.Missing_data,
			);
		});

		test("erreur: Email invalide.", async () => {
			const payload = new UserRegisterDTO();
			payload.email = "test@@";
			payload.password = UserSet.example.password;
			payload.pseudo = UserSet.example.pseudo;

			const response = await request
				.post("/api/users/register")
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.General.Invalid_data,
			);
			expect(response.body.data[0]).toHaveProperty("property", "email");
		});

		test("erreur: Mot de passe trop court.", async () => {
			const payload = new UserRegisterDTO();
			payload.email = UserSet.example.email;
			payload.password = "test";
			payload.pseudo = UserSet.example.pseudo;

			const response = await request
				.post("/api/users/register")
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.General.Invalid_data,
			);
			expect(response.body.data[0]).toHaveProperty(
				"property",
				"password",
			);
		});

		test("succès: Utilisateur créé.", async () => {
			const payload = new UserRegisterDTO();
			payload.email = UserSet.example.email;
			payload.password = UserSet.example.password;
			payload.pseudo = UserSet.example.pseudo;

			const response = await request
				.post("/api/users/register")
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(CreatedRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Success.Created,
			);

			// Récupération du token de confirmation ("envoyé par mail") pour les tests suivants.
			confirmToken = await createMailToken(response.body.data.id);
			Logger.debug(
				`Token de confirmation: ${confirmToken}`,
				"test: users",
				5,
			);
			const mails = mocked.mock.getSentMail();
			expect(mails).toHaveLength(1);
			expect(mails[0].from).toBe(process.env.MAIL_USER);
			expect(mails[0].to).toBe(UserSet.example.email);
			expect(mails[0].subject).toBe("Confirmation mail");
			expect(mails[0].html.toString()).toContain(
				confirmToken.slice(0, 10),
			);
		});

		test("erreur: Email déjà utilisé.", async () => {
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
				Responses.User.Email_already_exists,
			);
		});
	});

	describe("Users: GET /api/users/confirm/:token", async () => {
		test("erreur: Token invalide. (wrong)", async () => {
			const response = await request.get("/api/users/confirm/wrong");
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Token.Invalid,
			);
		});

		test("erreur: Token invalide. (Ex: base64)", async () => {
			const response = await request.get(
				"/api/users/confirm/MTEyX1VGVDE3MzYyNjQ5ODk4ODE=",
			);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Token.Invalid,
			);
		});

		test("succès: Inscription confirmée.", async () => {
			const response = await request.get(
				`/api/users/confirm/${confirmToken}`,
			);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Success.Confirmed,
			);
		});
	});

	describe("Users: POST /api/users/login", async () => {
		test("erreur: Il manque des données.", async () => {
			const response = await request.post("/api/users/login").send({});
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.General.Missing_data,
			);
		});
		test("erreur: Utilisateur introuvable.", async () => {
			const payload = new UserLoginDTO();
			payload.email = "test@example.com";
			payload.password = UserSet.example.password;

			const response = await request
				.post("/api/users/login")
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(NotFoundRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Not_found,
			);
		});
		test("erreur: Mot de passe incorrect.", async () => {
			const payload = new UserLoginDTO();
			payload.email = UserSet.example.email;
			payload.password = "wrong";

			const response = await request
				.post("/api/users/login")
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(UnauthorizedRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Invalid_password,
			);
		});
		test("succès: Connexion réussie.", async () => {
			const payload = new UserLoginDTO();
			payload.email = UserSet.example.email;
			payload.password = UserSet.example.password;

			const response = await request
				.post("/api/users/login")
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Auth.Success.Logged_in,
			);

			// Récupération du token pour les tests suivants.
			exampleToken = response.headers.authorization;
		});
	});

	describe("Users: GET /api/users/logout", async () => {
		test("erreur: Token manquant.", async () => {
			const response = await request.get("/api/users/logout");
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Token.Missing,
			);
		});

		test("succès: Déconnexion réussie.", async () => {
			const response = await request
				.get("/api/users/logout")
				.auth(exampleToken, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Auth.Success.Logged_out,
			);
		});
	});

	describe("Users: GET /api/users/:id", async () => {
		// L'utilisateur n'est toujours pas connecté après son inscription.
		test("erreur: Token manquant.", async () => {
			const response = await request.get("/api/users/1");
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Token.Missing,
			);
		});
		test("erreur: Token invalide.", async () => {
			const response = await request
				.get("/api/users/1")
				.auth("wrong", { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(UnauthorizedRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Token.Invalid,
			);
		});

		// L'utilisateur est connecté.
		test("succès: Utilisateur trouvé.", async () => {
			exampleToken = await login(UserSet.example);

			const response = await request
				.get(`/api/users/${UserSet.example.id}`)
				.auth(exampleToken, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Success.Found,
			);
		});
	});
	describe("Users: PUT /api/users/:id", async () => {
		test("ID: 40 -> erreur: Permission refusée.", async () => {
			exampleToken = await login(UserSet.example);

			const response = await request
				.put("/api/users/40")
				.auth(exampleToken, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(ForbiddenRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.General.Forbidden,
			);
		});

		test("ID: 112 -> erreur: Mot de passe incorrect.", async () => {
			exampleToken = await login(UserSet.example);

			const payload = new UserUpdateDTO();
			payload.currentPassword = "wrong";
			payload.newPassword = UserSet.example.newPassword;

			const response = await request
				.put(`/api/users/${UserSet.example.id}`)
				.auth(exampleToken, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(UnauthorizedRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Invalid_password,
			);
		});

		test("ID: 101 -> erreur: Url de la photo de profil invalide.", async () => {
			exampleToken = await login(UserSet.unitTestUser2);

			const payload = new UserUpdateDTO();
			payload.urlPfp = "wrong";

			const response = await request
				.put(`/api/users/${UserSet.unitTestUser2.id}`)
				.auth(exampleToken, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body.data[0]).toHaveProperty("property", "urlPfp");
		});

		test("ID: 101 -> erreur: Url de la photo de profil n'est pas une image.", async () => {
			exampleToken = await login(UserSet.unitTestUser2);

			const payload = new UserUpdateDTO();
			payload.urlPfp = "https://google.com";

			const response = await request
				.put(`/api/users/${UserSet.unitTestUser2.id}`)
				.auth(exampleToken, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Invalid_profile_url,
			);
		});

		test("ID: 101 -> Url de la photo de profil modifié.", async () => {
			exampleToken = await login(UserSet.unitTestUser1);

			const payload = new UserUpdateDTO();
			payload.urlPfp = UserSet.unitTestUser1.urlPfp;

			const response = await request
				.put(`/api/users/${UserSet.unitTestUser1.id}`)
				.auth(exampleToken, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(OkRes.statut);
		});

		test("ID: 101 -> erreur: Thème incorrect.", async () => {
			exampleToken = await login(UserSet.unitTestUser1);

			const payload = new UserUpdateDTO();
			payload.theme = 34;

			const response = await request
				.put(`/api/users/${UserSet.unitTestUser1.id}`)
				.auth(exampleToken, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Invalid_theme,
			);
		});

		test("ID: 101 -> succès: Thème modifié.", async () => {
			exampleToken = await login(UserSet.unitTestUser1);

			const payload = new UserUpdateDTO();
			payload.theme = Theme.FlashBang;

			const response = await request
				.put(`/api/users/${UserSet.unitTestUser1.id}`)
				.auth(exampleToken, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(OkRes.statut);
		});

		test("ID: 112 -> Mot de passe modifié.", async () => {
			exampleToken = await login(UserSet.example);

			const payload = new UserUpdateDTO();
			payload.currentPassword = UserSet.example.password;
			payload.newPassword = UserSet.example.newPassword;

			const response = await request
				.put(`/api/users/${UserSet.example.id}`)
				.auth(exampleToken, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Success.Updated,
			);
		});
	});

	describe("Users: DELETE /api/users/:id", async () => {
		test("ID: 101 -> erreur: Token invalide.", async () => {
			const response = await request
				.delete("/api/users/101")
				.auth("wrong", { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(UnauthorizedRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Token.Invalid,
			);
		});

		test("ID: 1 -> erreur: Utilisateur introuvable.", async () => {
			const token = await login(UserSet.unitTestUser1);

			const response = await request
				.delete("/api/users/1")
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(NotFoundRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Not_found,
			);
		});

		test("ID: 102 -> erreur: Permission refusée. (Connecté: User (ID:101))", async () => {
			const token = await login(UserSet.unitTestUser1);

			const response = await request
				.delete("/api/users/102")
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(ForbiddenRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.General.Forbidden,
			);
		});

		test("ID: 102 -> Utilisateur supprimé.", async () => {
			const token = await login(UserSet.unitTestUser2);

			const response = await request
				.delete("/api/users/102")
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.User.Success.Deleted,
			);
		});
	});

	describe("Users: GET /api/users/quota", async () => {
		test("succès: Quota de l'utilisateur trouvés.", async () => {
			const token = await login(UserSet.unitTestUser1);

			const response = await request
				.get("/api/users/quota")
				.auth(token, { type: "bearer" });

			Logger.debug(JSON.stringify(response.body), "test: users", 5);
			expect(response.status).toBe(OkRes.statut);
		});
	});

	describe("Users: POST /api/users/recover", async () => {
		test.todo("erreur: Email introuvable.");
		test.todo("succès: Mail de récupération envoyé");
	});
};

/**
 * Fonction de connexion pour les tests.
 * @param user Utilisateur à connecter.
 * @returns Token de connexion.
 */
async function login(user: {
	email: string;
	password: string;
}): Promise<string> {
	const payload = new UserLoginDTO();
	payload.email = user.email;
	payload.password = user.password;

	const response = await request.post("/api/users/login").send(payload);
	return response.headers.authorization;
}
