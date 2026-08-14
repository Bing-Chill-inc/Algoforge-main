import { describe, expect, test } from "bun:test";
import { analyzeAlgorithm } from "../src/anomalies/engine";
import { createAnalysisSnapshot } from "../src/anomalies/snapshot";

const dictionary = { typeElement: "DictionnaireDonnee", types: {}, signification: {} };

function findingsFor(...nodes: unknown[]) {
	return analyzeAlgorithm(createAnalysisSnapshot([...nodes, dictionary])).findings;
}

describe("incomplete editor placeholders", () => {
	test("empty problems and procedures remain neutral while their fields are being edited", () => {
		expect(findingsFor(
			{ typeElement: "Probleme", libelle: "   ", listeDonnes: ["entree"], listeResultats: ["sortie"], enfants: [] },
			{ typeElement: "Procedure", libelle: "", listeDonnes: ["valeur"], listeResultats: [], enfants: [] },
		)).toEqual([]);
	});

	test("an IF with an empty condition does not produce condition or structure findings", () => {
		expect(findingsFor({
			typeElement: "Probleme",
			libelle: "Choisir",
			listeDonnes: ["choix"],
			listeResultats: [],
			enfants: [{
				typeElement: "StructureSi",
				conditions: ["choix = 1", "choix = 2", "choix = 3", ""].map((libelle) => ({
					typeElement: "Condition",
					libelle,
					enfants: [],
				})),
			}],
		})).toEqual([]);
	});

	test("empty switch and loop structures remain neutral", () => {
		expect(findingsFor(
			{ typeElement: "StructureSwitch", expressionATester: "", conditions: [{ typeElement: "Condition", libelle: "", enfants: [] }] },
			{ typeElement: "StructureIterativeNonBornee", enfants: [] },
			{ typeElement: "StructureIterativeBornee", variableAIterer: "", borneInferieure: "", borneSuperieure: "", pas: "", enfants: [] },
		)).toEqual([]);
	});

	test("empty problems do not count toward the seven-child readability threshold", () => {
		expect(findingsFor(...Array.from({ length: 8 }, () => ({
			typeElement: "Probleme",
			libelle: "",
			listeDonnes: [],
			listeResultats: [],
			enfants: [],
		})))).toEqual([]);
	});
});
