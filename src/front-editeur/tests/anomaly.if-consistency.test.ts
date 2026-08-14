import { describe, expect, test } from "bun:test";
import { analyzeAlgorithm } from "../src/anomalies/engine";
import { createAnalysisSnapshot } from "../src/anomalies/snapshot";

function analyzeConditions(conditions: string[]) {
	const algorithm = [
		{
			typeElement: "Probleme",
			libelle: "",
			listeDonnes: [],
			listeResultats: [],
			enfants: [{
				typeElement: "StructureSi",
				conditions: conditions.map((libelle) => ({
					typeElement: "Condition",
					libelle,
					enfants: [],
				})),
			}],
		},
		{ typeElement: "DictionnaireDonnee" },
	];

	return analyzeAlgorithm(createAnalysisSnapshot(algorithm)).findings;
}

describe("IF information consistency", () => {
	test("does not contradict a valid switch suggestion", () => {
		const findings = analyzeConditions(["a = 1", "a = 2", "a = 3"]);

		expect(findings.map(({ ruleId }) => ruleId)).toEqual(["if-prefer-switch"]);
	});

	test("still warns when branches test unrelated information", () => {
		const findings = analyzeConditions(["premiere = 1", "seconde = 2"]);

		expect(findings.some(({ ruleId }) => ruleId === "inconsistent-if-information")).toBe(true);
	});
});
