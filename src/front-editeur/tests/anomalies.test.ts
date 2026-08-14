import { describe, expect, test } from "bun:test";
import { analyzeAlgorithm, ANOMALY_RULE_IDS } from "../src/anomalies/engine";
import {
	extractIdentifiers,
	normalizeAssignment,
	normalizeComparison,
	parseAssignment,
	parseCondition,
} from "../src/anomalies/parser";
import { createAnalysisSnapshot } from "../src/anomalies/snapshot";
import type { AnalysisPlanLayout, AnomalyRuleId } from "../src/anomalies/types";

type JsonNode = Record<string, unknown>;

const problem = (
	label = "",
	inputs: string[] = [],
	outputs: string[] = [],
	children: JsonNode[] = [],
): JsonNode => ({ typeElement: "Probleme", libelle: label, listeDonnes: inputs, listeResultats: outputs, enfants: children });
const branch = (label: string, children: JsonNode[] = []): JsonNode => ({ typeElement: "Condition", libelle: label, enfants: children });
const ifNode = (...branches: JsonNode[]): JsonNode => ({ typeElement: "StructureSi", conditions: branches });
const switchNode = (expression: string, ...branches: JsonNode[]): JsonNode => ({ typeElement: "StructureSwitch", expressionATester: expression, conditions: branches });
const bounded = (children: JsonNode[], overrides: JsonNode = {}): JsonNode => ({
	typeElement: "StructureIterativeBornee",
	variableAIterer: "i",
	borneInferieure: "1",
	borneSuperieure: "10",
	pas: "1",
	croissant: true,
	enfants: children,
	...overrides,
});
const unbounded = (...children: JsonNode[]): JsonNode => ({ typeElement: "StructureIterativeNonBornee", enfants: children });
const exitNode = (): JsonNode => ({ typeElement: "ConditionSortie" });
const dictionary = (types: Record<string, string> = {}): JsonNode => ({ typeElement: "DictionnaireDonnee", types });
const documentOf = (...nodes: JsonNode[]): JsonNode[] => [...nodes, dictionary()];
const hasRule = (document: unknown, ruleId: AnomalyRuleId, layouts: AnalysisPlanLayout[] = []): boolean =>
	analyzeAlgorithm(createAnalysisSnapshot(document, layouts)).findings.some((finding) => finding.ruleId === ruleId);

interface RuleFixture {
	id: AnomalyRuleId;
	positive: JsonNode[];
	negative: JsonNode[];
	nearMiss?: JsonNode[];
	layouts?: AnalysisPlanLayout[];
	negativeLayouts?: AnalysisPlanLayout[];
}

const ruleFixtures: RuleFixture[] = [
	{
		id: "magic-input",
		positive: documentOf(problem("Racine", [], [], [problem("Sous-problème", ["secret"])])),
		negative: documentOf(problem("Racine", [], [], [problem("Produire", [], ["valeur"]), problem("Consommer", ["valeur"])])),
	},
	{
		id: "unused-input",
		positive: documentOf(problem("Racine", ["entrée"])),
		negative: documentOf(problem("Racine", ["entrée"], [], [problem("résultat ← entrée")])),
		nearMiss: documentOf(problem("Racine", ["entrée complète"], [], [problem("résultat ← entrée complète")])),
	},
	{
		id: "unused-output",
		positive: documentOf(problem("Racine", [], [], [problem("Produire", [], ["orphelin"])])),
		negative: documentOf(problem("Racine", [], [], [problem("Produire", [], ["valeur"]), problem("Consommer", ["valeur"])])),
	},
	{
		id: "magic-variable",
		positive: documentOf(problem("résultat ← inconnue")),
		negative: documentOf(problem("résultat ← entrée", ["entrée"])),
		nearMiss: documentOf(problem("message ← \"inconnue\"")),
	},
	{
		id: "exit-outside-loop",
		positive: documentOf(exitNode()),
		negative: documentOf(unbounded(ifNode(branch("terminé = vrai", [exitNode()])))),
	},
	{
		id: "exit-in-bounded-loop",
		positive: documentOf(bounded([ifNode(branch("terminé = vrai", [exitNode()]))])),
		negative: documentOf(bounded([unbounded(ifNode(branch("terminé = vrai", [exitNode()]))) ])),
	},
	{
		id: "unreachable-after-exit",
		positive: documentOf(unbounded(ifNode(branch("terminé = vrai", [exitNode(), problem("Impossible")])))),
		negative: documentOf(unbounded(ifNode(branch("terminé = vrai", [problem("Possible"), exitNode()])))),
	},
	{
		id: "invalid-comparison-syntax",
		positive: documentOf(ifNode(branch("valeur == 1"))),
		negative: documentOf(ifNode(branch("valeur = 1"))),
		nearMiss: documentOf(ifNode(branch("Sinon"))),
	},
	{
		id: "invalid-assignment-syntax",
		positive: documentOf(problem("résultat = 1")),
		negative: documentOf(problem("résultat ← 1")),
		nearMiss: documentOf(problem("Calculer le résultat")),
	},
	{
		id: "unbounded-loop-without-exit",
		positive: documentOf(unbounded(problem("Continuer"))),
		negative: documentOf(unbounded(ifNode(branch("terminé = vrai", [exitNode()])))),
	},
	{
		id: "nonterminating-bounded-loop",
		positive: documentOf(bounded([], { pas: "0" })),
		negative: documentOf(bounded([])),
		nearMiss: documentOf(bounded([], { borneSuperieure: "maximum" })),
	},
	{
		id: "too-many-children",
		positive: documentOf(...Array.from({ length: 8 }, (_, index) => problem(`Étape ${index}`))),
		negative: documentOf(...Array.from({ length: 7 }, (_, index) => problem(`Étape ${index}`))),
	},
	{
		id: "plan-too-large",
		positive: documentOf(problem("Racine")),
		negative: documentOf(problem("Racine")),
		layouts: [{ path: "plan:root", targetPaths: ["plan:root/n0"], width: 120, height: 30, viewportWidth: 100, viewportHeight: 50 }],
		negativeLayouts: [{ path: "plan:root", targetPaths: ["plan:root/n0"], width: 100, height: 50, viewportWidth: 100, viewportHeight: 50 }],
	},
	{
		id: "inconsistent-alternative-types",
		positive: [switchNode("choix", branch("1"), branch("\"deux\"")), dictionary({ choix: "Entier" })],
		negative: [switchNode("choix", branch("1"), branch("2")), dictionary({ choix: "Entier" })],
		nearMiss: documentOf(switchNode("choix", branch("CONSTANTE"), branch("2"))),
	},
	{
		id: "inconsistent-if-information",
		positive: documentOf(ifNode(branch("x = 1"), branch("y = 2"))),
		negative: documentOf(ifNode(branch("x = 1"), branch("x = 2"))),
	},
	{
		id: "switch-case-comparison",
		positive: documentOf(switchNode("choix", branch("choix = 1"))),
		negative: documentOf(switchNode("choix", branch("1"), branch("Sinon"))),
	},
	{
		id: "if-prefer-switch",
		positive: documentOf(ifNode(branch("choix = 1"), branch("choix = 2"), branch("choix = 3"), branch("Sinon"))),
		negative: documentOf(ifNode(branch("choix = 1"), branch("choix = 2"))),
		nearMiss: documentOf(ifNode(branch("choix > 1"), branch("choix > 2"), branch("choix > 3"))),
	},
	{
		id: "dynamic-type",
		positive: documentOf(problem("valeur ← 1"), problem("valeur ← \"texte\"")),
		negative: documentOf(problem("valeur ← 1"), problem("valeur ← 2")),
		nearMiss: documentOf(problem("valeur ← expression"), problem("valeur ← 2")),
	},
];

describe("18 isolated anomaly rules", () => {
	test("the fixture catalog covers every registered rule exactly once", () => {
		expect(ruleFixtures.map(({ id }) => id)).toEqual(ANOMALY_RULE_IDS);
	});

	for (const fixture of ruleFixtures) {
		test(`${fixture.id}: positive, negative, and near-miss`, () => {
			expect(hasRule(fixture.positive, fixture.id, fixture.layouts)).toBe(true);
			expect(hasRule(fixture.negative, fixture.id, fixture.negativeLayouts)).toBe(false);
			expect(hasRule(fixture.nearMiss ?? fixture.negative, fixture.id, fixture.negativeLayouts)).toBe(false);
		});
	}
});

describe("expression parser", () => {
	test("supports literals, Unicode identifiers, multiword names and aliases", () => {
		expect(parseAssignment("résultat final <- température été + 1", ["résultat final", "température été"])).toMatchObject({
			isAssignment: true,
			valid: true,
			lhs: "résultat final",
			identifiers: ["température été"],
		});
		const condition = parseCondition("NON (température été >= 18 ET prêt = vrai) || mode = \"ET\"", ["température été", "prêt", "mode"]);
		expect(condition.valid).toBe(true);
		expect(condition.identifiers).toEqual(expect.arrayContaining(["température été", "prêt", "mode"]));
	});

	test("rejects malformed expressions and AlgoForge-incompatible comparison syntax", () => {
		expect(parseCondition("(x = 1 OU").valid).toBe(false);
		expect(parseCondition("x == 1")).toMatchObject({ valid: false, usesDoubleEquals: true });
		expect(parseAssignment("x -> 1")).toMatchObject({ isAssignment: true, valid: false });
	});

	test("excludes quoted text and avoids substring collisions", () => {
		expect(extractIdentifiers("message ← \"nom total\" + total", ["nom", "total"])).toEqual(expect.arrayContaining(["message", "total"]));
		expect(extractIdentifiers("totalité + total", ["total"])).toEqual(["total", "totalité"]);
	});

	test("normalizes only recognized operators", () => {
		expect(normalizeAssignment("résultat = 2")).toBe("résultat ← 2");
		expect(normalizeComparison("texte = \"a == b\" ET x == 2")).toBe("texte = \"a == b\" ET x = 2");
	});
});

describe("snapshot adapter", () => {
	test("creates ephemeral paths and freezes the graph without changing JSON", () => {
		const source = [problem("Racine", [], [], [ifNode(branch("Sinon", [problem("Fin")]))]), dictionary({ valeur: "Entier" })];
		const before = JSON.stringify(source);
		const snapshot = createAnalysisSnapshot(source);
		expect(snapshot.roots.nodes[0]?.path).toBe("plan:root/n0");
		expect(snapshot.roots.nodes[0]?.sequences[0]?.nodes[0]?.sequences[0]?.path).toBe("plan:root/n0/s0/n0/b0");
		expect(snapshot.dictionary.valeur).toBe("Entier");
		expect(Object.isFrozen(snapshot)).toBe(true);
		expect(JSON.stringify(source)).toBe(before);
	});
});
