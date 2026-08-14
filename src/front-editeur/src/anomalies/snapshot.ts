import type {
	AnalysisNode,
	AnalysisNodeKind,
	AnalysisPlanLayout,
	AnalysisSequence,
	AnalysisSnapshot,
} from "./types";

type JsonRecord = Record<string, unknown>;

/**
 * Converts AlgoForge's persisted document shape into the small, immutable graph
 * consumed by the anomaly rules. Paths deliberately exist only for a capture:
 * they are never written back to the algorithm JSON.
 */
export function createAnalysisSnapshot(
	document: unknown,
	layouts: readonly AnalysisPlanLayout[] = [],
): AnalysisSnapshot {
	const records = asRecordArray(document);
	const dictionaryRecord = records.find((record) => record.typeElement === "DictionnaireDonnee");
	const roots = createSequence(
		records.filter((record) => record.typeElement !== "DictionnaireDonnee"),
		"plan:root",
	);
	const dictionary = asStringRecord(dictionaryRecord?.types ?? dictionaryRecord?.contenu);
	return freezeSnapshot({
		roots,
		dictionary,
		layouts: layouts.map((layout) => ({ ...layout, targetPaths: [...layout.targetPaths] })),
	});
}

function createSequence(records: readonly JsonRecord[], path: string, label?: string): AnalysisSequence {
	return {
		path,
		label: clean(label),
		nodes: records.flatMap((record, index) => {
			const node = createNode(record, `${path}/n${index}`);
			return node ? [node] : [];
		}),
	};
}

function createNode(record: JsonRecord, path: string): AnalysisNode | undefined {
	const kind = nodeKind(record.typeElement);
	if (!kind) return undefined;
	const childRecords = asRecordArray(record.enfants);
	let sequences: AnalysisSequence[] = [];
	if (kind === "if" || kind === "switch") {
		sequences = asRecordArray(record.conditions).map((condition, index) =>
			createSequence(asRecordArray(condition.enfants), `${path}/b${index}`, asString(condition.libelle)),
		);
	} else if (childRecords.length) {
		const planPath = record.estDecomposeAilleurs === true ? `${path}/plan` : `${path}/s0`;
		sequences = [createSequence(childRecords, planPath)];
	}
	return {
		path,
		kind,
		label: clean(asString(record.libelle)),
		inputs: asNames(record.listeDonnes),
		outputs: asNames(record.listeResultats),
		expression: clean(asString(record.expressionATester)),
		iterator: clean(asString(record.variableAIterer)),
		lowerBound: clean(asString(record.borneInferieure)),
		upperBound: clean(asString(record.borneSuperieure)),
		step: clean(asString(record.pas)),
		increasing: typeof record.croissant === "boolean" ? record.croissant : undefined,
		sequences,
	};
}

function nodeKind(value: unknown): AnalysisNodeKind | undefined {
	switch (value) {
		case "Probleme": return "problem";
		case "Procedure": return "procedure";
		case "StructureSi": return "if";
		case "StructureSwitch": return "switch";
		case "StructureIterativeBornee": return "bounded-loop";
		case "StructureIterativeNonBornee": return "unbounded-loop";
		case "ConditionSortie": return "exit";
		default: return undefined;
	}
}

function asRecordArray(value: unknown): JsonRecord[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is JsonRecord => isRecord(item));
}

function asNames(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.flatMap((item) => {
		if (typeof item === "string") return clean(item) ? [item.trim()] : [];
		if (!isRecord(item)) return [];
		const name = asString(item.nom ?? item._nom ?? item.name);
		return clean(name) ? [name.trim()] : [];
	});
}

function asStringRecord(value: unknown): Record<string, string | undefined> {
	if (!isRecord(value)) return {};
	return Object.fromEntries(Object.entries(value).flatMap(([key, entry]) => {
		const normalizedKey = key.trim();
		return normalizedKey ? [[normalizedKey, typeof entry === "string" ? entry : undefined]] : [];
	}));
}

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
	return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function clean(value: string | undefined): string | undefined {
	const normalized = value?.replace(/\u00a0/gu, " ").trim();
	return normalized || undefined;
}

function freezeSnapshot(snapshot: AnalysisSnapshot): AnalysisSnapshot {
	freezeSequence(snapshot.roots);
	for (const layout of snapshot.layouts) {
		Object.freeze(layout.targetPaths);
		Object.freeze(layout);
	}
	Object.freeze(snapshot.layouts);
	Object.freeze(snapshot.dictionary);
	return Object.freeze(snapshot);
}

function freezeSequence(sequence: AnalysisSequence): void {
	for (const node of sequence.nodes) {
		for (const child of node.sequences) freezeSequence(child);
		Object.freeze(node.inputs);
		Object.freeze(node.outputs);
		Object.freeze(node.sequences);
		Object.freeze(node);
	}
	Object.freeze(sequence.nodes);
	Object.freeze(sequence);
}
