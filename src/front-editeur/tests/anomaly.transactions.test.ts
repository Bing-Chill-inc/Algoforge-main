import { describe, expect, test } from "bun:test";
import { replaceIfWithSwitch, runDocumentTransaction } from "../src/anomalies/transactions";

describe("anomaly fix transactions", () => {
	test("converts a qualifying IF to a switch and records exactly one undoable action", () => {
		let document: unknown[] = [
			{
				typeElement: "StructureSi",
				conditions: [
					{ typeElement: "Condition", libelle: "choix = 1", enfants: [] },
					{ typeElement: "Condition", libelle: "choix = 2", enfants: [] },
					{ typeElement: "Condition", libelle: "choix = 3", enfants: [] },
					{ typeElement: "Condition", libelle: "Sinon", enfants: [] },
				],
			},
			{ typeElement: "DictionnaireDonnee", types: {} },
		];
		const history: Array<{ annuler(): void; retablir(): void }> = [];
		const editor = {
			serializeDocument: () => structuredClone(document),
			applyDocumentSnapshot: (value: unknown[]) => { document = structuredClone(value); },
			ajouterEvenement: (event: { annuler(): void; retablir(): void }) => history.push(event),
		};

		expect(runDocumentTransaction(editor, "IF vers switch", (value) =>
			replaceIfWithSwitch(value, "plan:root/n0", "choix", ["1", "2", "3"]),
		)).toBe(true);
		expect(history).toHaveLength(1);
		expect(document[0]).toMatchObject({
			typeElement: "StructureSwitch",
			expressionATester: "choix",
			conditions: [
				{ libelle: "1" },
				{ libelle: "2" },
				{ libelle: "3" },
				{ libelle: "Sinon" },
			],
		});
		history[0]?.annuler();
		expect(document[0]).toMatchObject({ typeElement: "StructureSi" });
		history[0]?.retablir();
		expect(document[0]).toMatchObject({ typeElement: "StructureSwitch" });
	});

	test("rejects stale paths without recording history", () => {
		const document: unknown[] = [{ typeElement: "DictionnaireDonnee" }];
		const history: unknown[] = [];
		const editor = {
			serializeDocument: () => document,
			applyDocumentSnapshot: () => undefined,
			ajouterEvenement: (event: unknown) => history.push(event),
		};
		expect(runDocumentTransaction(editor, "stale", (value) =>
			replaceIfWithSwitch(value, "plan:root/n9", "choix", ["1", "2", "3"]),
		)).toBe(false);
		expect(history).toHaveLength(0);
	});
});
