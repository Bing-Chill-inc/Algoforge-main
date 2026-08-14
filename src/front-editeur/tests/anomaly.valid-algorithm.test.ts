import { describe, expect, test } from "bun:test";
import { analyzeAlgorithm } from "../src/anomalies/engine";
import { extractIdentifiers } from "../src/anomalies/parser";
import { createAnalysisSnapshot } from "../src/anomalies/snapshot";

describe("valid first-occurrence search regression", () => {
	test("does not report descriptive labels or in-out parameters as variables", () => {
		const algorithm = [
			{
				typeElement: "Probleme",
				libelle: "Recherche de première occurrence",
				listeDonnes: ["structure"],
				listeResultats: ["trouve"],
				enfants: [
					{
						typeElement: "Probleme",
						libelle: "Initialiser la recherche",
						listeDonnes: [],
						listeResultats: ["trouve"],
						enfants: [
							{ typeElement: "Probleme", libelle: "Se positionner en début de structure", listeDonnes: [], listeResultats: [], enfants: [] },
							{ typeElement: "Probleme", libelle: "trouve ← faux", listeDonnes: [], listeResultats: [], enfants: [] },
						],
					},
					{
						typeElement: "Probleme",
						libelle: "Effectuer la recherche",
						listeDonnes: ["trouve"],
						listeResultats: ["trouve"],
						enfants: [{
							typeElement: "StructureIterativeNonBornee",
							enfants: [
								{
									typeElement: "Probleme",
									libelle: "Déterminer si tous les éléments ont été analysés",
									listeDonnes: [],
									listeResultats: [],
									enfants: [{
										typeElement: "StructureSi",
										conditions: [{ typeElement: "Condition", libelle: "Tous les éléments ont été analysés = vrai", enfants: [{ typeElement: "ConditionSortie" }] }],
									}],
								},
								{
									typeElement: "Probleme",
									libelle: "Vérifier si on a trouvé ce qu’on cherche",
									listeDonnes: [],
									listeResultats: [],
									enfants: [{
										typeElement: "StructureSi",
										conditions: [{
											typeElement: "Condition",
											libelle: "L'élément courant vérifie la propriété recherchée",
											enfants: [
												{ typeElement: "Probleme", libelle: "trouve ← vrai", listeDonnes: [], listeResultats: [], enfants: [] },
												{ typeElement: "ConditionSortie" },
											],
										}],
									}],
								},
							],
						}],
					},
				],
			},
			{ typeElement: "DictionnaireDonnee" },
		];

		expect(analyzeAlgorithm(createAnalysisSnapshot(algorithm))).toEqual({ findings: [], failures: [] });
	});

	test("French apostrophes do not start quoted strings", () => {
		expect(extractIdentifiers("L'élément courant")).toEqual(["L", "élément", "courant"]);
		expect(extractIdentifiers("message ← 'texte ignoré' + valeur")).toEqual(["message", "valeur"]);
	});
});
