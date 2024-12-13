// TODO: Ajouter tous les tests pour les routes de l'API des algorithmes.
// Il faudra intégrer des tests intermédiaires, plus précisément avec des vérifications des données envoyées.
import { Logger } from "../utils/logger";
import { server, request } from "./setup";
import { AlgoValidator } from "../utils/algoValidator";
import { readFileSync } from "fs";

import { describe, expect, test } from "bun:test";
import path from "path";

/**
 * Tests des routes de l'API des algorithmes.
 * Nous considérons que la base de données est vide.
 */
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

/**
 * Tests du service de la validation des algorithmes.
 * Nous considérons que les algorithmes en input de test sont des objets json valides.
 * Ce qui nous intéresse ici est de vérifier que l'algorithme est bien conforme à la structure attendue.
 */
describe("Algos: Validator", () => {
	test("Algo référence n°1. -> aucune erreur.", async () => {
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
	test("Algo référence n°4. -> présence de décompositions.", async () => {
		// Validation de l'algorithme.
		const result = validationAlgo("algo-4");
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
