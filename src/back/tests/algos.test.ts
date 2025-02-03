import { existsSync, readFileSync, rmdirSync } from "fs";
import path from "path";
import { describe, test, expect, beforeAll } from "bun:test";
import { AlgoValidator } from "../utils/algoValidator";
import { Logger } from "../utils/logger";
import { AlgosService } from "../api/algos/algos.service";
import { UserLoginDTO } from "../api/users/users.dto";
import { UserSet } from "./user.set";
import { request, server } from "./setup.test";
import { Responses } from "../constants/responses.const";
import {
	BadRequestRes,
	CreatedRes,
	NotFoundRes,
	OkRes,
} from "../types/response.entity";
import { AlgoCreateDTO, AlgoUpdateDTO } from "../api/algos/algos.dto";
import { AppDataSource } from "../db/data-source";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";
import { hashString } from "../utils/hash";

const utilisateursRepository = AppDataSource.getRepository(Utilisateur);
let token: string;

// TODO: Tester les routes individuellement, et non en fonction des données que peut contenir la base de données.
export const AlgosTests = async () => {
	beforeAll(async (done) => {
		const interval = setInterval(async () => {
			if (server.locals.testSetupDone) {
				clearInterval(interval);

				Logger.log("Clearing data/algos folder...", "test: algos");
				if (existsSync(AlgosService.dataPath))
					rmdirSync(AlgosService.dataPath, { recursive: true });
				Logger.log("Cleared !", "test: algos");

				Logger.log("Creating test users...", "test: users");
				for (const user of [
					UserSet.unitTestAlgo1,
					UserSet.unitTestAlgo2,
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

				Logger.log("Logging in with user (ID: 111)...", "test: algos");
				const payload = new UserLoginDTO();
				payload.email = UserSet.unitTestAlgo1.email;
				payload.password = UserSet.unitTestAlgo1.password;
				const response = await request
					.post("/api/users/login")
					.send(payload);
				Logger.debug(JSON.stringify(response.body), "test: algos", 5);
				token = response.headers.authorization;
				Logger.log(`Logged in ! Token: ${token}`, "test: algos");

				done();
			}
		}, 100);
	});

	/**
	 * Tests des routes de l'API des algorithmes.
	 * Nous considérons que la base de données est vide,
	 * et que l'utilisateur est vérifié et connecté.
	 */
	describe("Algos: empty database", async () => {
		test("GET /api/algos/byUserId/:id -> erreur: Aucun algorithme trouvé.", async () => {
			const response = await request
				.get(`/api/algos/byUserId/${UserSet.unitTestAlgo1.id}`)
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			expect(response.status).toBe(NotFoundRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.By_User.Not_found,
			);
		});

		test("GET /api/algos/:id -> erreur: Algorithme non trouvé.", async () => {
			const response = await request
				.get("/api/algos/1")
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			expect(response.status).toBe(NotFoundRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.Not_found,
			);
		});

		test("POST /api/algos/ -> erreur: Données manquantes.", async () => {
			const response = await request
				.post("/api/algos")
				.auth(token, { type: "bearer" })
				.send({});
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.General.Missing_data,
			);
		});

		test("PUT /api/algos/:id -> erreur: Données manquantes.", async () => {
			const response = await request
				.put("/api/algos/1")
				.auth(token, { type: "bearer" })
				.send({});
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.General.Missing_data,
			);
		});

		test("DELETE /api/algos/:id -> erreur: Algorithme non trouvé.", async () => {
			const response = await request
				.delete("/api/algos/1")
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			expect(response.status).toBe(NotFoundRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.Not_found,
			);
		});
	});

	/**
	 * Tests des routes de l'API des algorithmes, avec la manipulation de plusieurs algorithmes.
	 */
	describe("Algos: creating data", () => {
		test("POST /api/algos/ -> erreur: Algorithme invalide.", async () => {
			const payload = new AlgoCreateDTO();
			payload.nom = "Algorithme test";
			payload.ownerId = UserSet.unitTestAlgo1.id;
			payload.sourceCode = readAlgo("algo-3");

			const response = await request
				.post("/api/algos")
				.auth(token, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			// Vérification de la réponse.
			expect(response.status).toBe(BadRequestRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.Invalid,
			);

			// Vérification de la non-création de l'algorithme.
			const filePath = AlgosService.dataPath + "1.json";
			expect(existsSync(filePath)).toBe(false);
		});
		test("POST /api/algos/ -> succès: Algorithme créé.", async () => {
			const payload = new AlgoCreateDTO();
			payload.nom = "Algorithme test";
			payload.ownerId = UserSet.unitTestAlgo1.id;
			payload.sourceCode = readAlgo("algo-complet");

			const response = await request
				.post("/api/algos")
				.auth(token, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			// Vérification de la réponse.
			expect(response.status).toBe(CreatedRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.Success.Created,
			);

			// Vérification de la création de l'algorithme.
			const filePath = AlgosService.dataPath + "1.json";
			expect(existsSync(filePath)).toBe(true);
		});
		test("PUT /api/algos/:id -> succès: Algorithme mis à jour.", async () => {
			const payload = new AlgoUpdateDTO();
			payload.id = 1;
			payload.nom = "Algorithme test mis à jour";
			payload.permsAlgorithme = []; // On ne change pas les permissions.
			payload.sourceCode = readAlgo("algo-1");

			const response = await request
				.put("/api/algos/1")
				.auth(token, { type: "bearer" })
				.send(payload);
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			// Vérification de la réponse.
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.Success.Updated,
			);

			// Vérification de la mise à jour de l'algorithme.
			const filePath = AlgosService.dataPath + "1.json";
			expect(existsSync(filePath)).toBe(true);
		});
		test("GET /api/algos/byUserId/:id -> succès: Algorithme trouvé.", async () => {
			const response = await request
				.get(`/api/algos/byUserId/${UserSet.unitTestAlgo1.id}`)
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.By_User.Found,
			);
			expect(response.body.data).toBeArrayOfSize(1);
		});

		test("GET /api/algos/:id -> succès: Algorithme trouvé.", async () => {
			const response = await request
				.get("/api/algos/1")
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.Success.Found,
			);
			expect(response.body.data.sourceCode).toEqual(
				readAlgo("algo-complet"),
			);
		});

		test("DELETE /api/algos/:id -> erreur: Algorithme non trouvé.", async () => {
			const response = await request
				.delete("/api/algos/2")
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			expect(response.status).toBe(NotFoundRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.Not_found,
			);
		});
		test("DELETE /api/algos/:id -> succès: Algorithme supprimé.", async () => {
			const response = await request
				.delete("/api/algos/1")
				.auth(token, { type: "bearer" });
			Logger.debug(JSON.stringify(response.body), "test: algos", 5);
			expect(response.status).toBe(OkRes.statut);
			expect(response.body).toHaveProperty(
				"message",
				Responses.Algo.Success.Deleted,
			);
			expect(existsSync(AlgosService.dataPath + "1.json")).toBe(false);
		});
	});

	/**
	 * Tests du service de la validation des algorithmes.
	 * Nous considérons que les algorithmes en input de test sont des objets json valides.
	 * Ce qui nous intéresse ici est de vérifier que l'algorithme est bien conforme à la structure attendue.
	 */
	describe("Algos: Validator", () => {
		test("Algo référence n°1. -> aucune erreur: présence que de problèmes.", async () => {
			// Validation de l'algorithme.
			const result = validationAlgo("algo-1");
			// Vérification du résultat.
			expect(result).toHaveProperty("success", true);
		});
		test("Algo référence n°2. -> manquant: listeDonnes, listeResultats.", async () => {
			// Validation de l'algorithme.
			const result = validationAlgo("algo-2");
			// Vérification du résultat.
			expect(result).toHaveProperty("success", true);
		});
		test("Algo référence n°3. -> 8 erreurs: mauvais format de abscisse/ordonnee.", async () => {
			// Validation de l'algorithme.
			const result = validationAlgo("algo-3");
			// Vérification du résultat.
			expect(result.error.issues).toBeArrayOfSize(8);
		});
		test("Algo référence n°4. -> aucune erreur: présence de décompositions.", async () => {
			// Validation de l'algorithme.
			const result = validationAlgo("algo-4");
			// Vérification du résultat.
			expect(result).toHaveProperty("success", true);
		});
		test("Algo référence n°5. -> aucune erreur: présence de switch.", async () => {
			// Validation de l'algorithme.
			const result = validationAlgo("algo-5");
			// Vérification du résultat.
			expect(result).toHaveProperty("success", true);
		});
		test("Algo référence n°10. -> aucune erreur.", async () => {
			// Validation de l'algorithme.
			const result = validationAlgo("algo-complet");
			// Vérification du résultat.
			expect(result).toHaveProperty("success", true);
		});
	});
};

/**
 * Valide un algorithme.
 * @param algoName Nom/chemin de l'algorithme.
 * @returns Objet contenant le résultat de la validation.
 * @example
 * const result = validationAlgo("algo-1");
 * // => { success: true, data: [{...}] }
 */
function validationAlgo(algoName: string) {
	let result;
	try {
		// Récupération de l'algorithme de référence.
		const algo = readAlgo(algoName);
		// Validation de l'algorithme.
		result = AlgoValidator.validateAlgo(algo);
	} catch (error) {
		Logger.error(`${error.stack}`, "test: algos");
	}
	return result;
}

/**
 * Lit un algorithme depuis un fichier json.
 * @param algoName Nom/chemin de l'algorithme.
 * @returns L'algorithme sous forme d'objet json.
 * @example
 * const algo = readAlgo("algo-1");
 * // => [{ typeElement: "Probleme", ... }]
 */
function readAlgo(algoName: string) {
	return JSON.parse(
		readFileSync(path.join(__dirname, `./json/${algoName}.json`), "utf-8"),
	);
}
