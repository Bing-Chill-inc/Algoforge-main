type JsonRecord = Record<string, unknown>;

export interface UndoableEditor {
	serializeDocument(): unknown[];
	applyDocumentSnapshot(algorithm: unknown[]): void;
	ajouterEvenement(event: { annuler(): void; retablir(): void }): void;
}

export function runDocumentTransaction(
	editor: UndoableEditor,
	label: string,
	mutate: (document: unknown[]) => boolean,
): boolean {
	const before = structuredClone(editor.serializeDocument());
	const after = structuredClone(before);
	if (!mutate(after)) return false;
	editor.applyDocumentSnapshot(after);
	editor.ajouterEvenement({
		annuler: () => editor.applyDocumentSnapshot(structuredClone(before)),
		retablir: () => editor.applyDocumentSnapshot(structuredClone(after)),
	});
	return true;
}

export function replaceIfWithSwitch(
	document: unknown[],
	path: string,
	variable: string,
	values: readonly string[],
): boolean {
	const location = findNodeLocation(document, path);
	if (!location || location.node.typeElement !== "StructureSi") return false;
	const conditions = asRecordArray(location.node.conditions);
	let valueIndex = 0;
	const nextConditions: JsonRecord[] = [];
	for (const condition of conditions) {
		const label = typeof condition.libelle === "string" ? condition.libelle.trim() : "";
		if (label.toLocaleLowerCase() === "sinon") {
			nextConditions.push({ ...condition, libelle: "Sinon" });
			continue;
		}
		const value = values[valueIndex++];
		if (!value) return false;
		nextConditions.push({ ...condition, libelle: value });
	}
	if (valueIndex !== values.length) return false;
	location.container[location.index] = {
		...location.node,
		typeElement: "StructureSwitch",
		expressionATester: variable,
		conditions: nextConditions,
	};
	return true;
}

interface NodeLocation {
	container: unknown[];
	index: number;
	node: JsonRecord;
}

function findNodeLocation(document: unknown[], path: string): NodeLocation | undefined {
	const tokens = path.split("/");
	if (tokens.shift() !== "plan:root") return undefined;
	let container: unknown[] = document;
	let location: NodeLocation | undefined;
	for (const token of tokens) {
		const nodeMatch = /^n(\d+)$/u.exec(token);
		if (nodeMatch) {
			const index = Number(nodeMatch[1]);
			const node = container[index];
			if (!isRecord(node)) return undefined;
			location = { container, index, node };
			continue;
		}
		if (!location) return undefined;
		if (token === "s0" || token === "plan") {
			container = asMutableArray(location.node.enfants);
			continue;
		}
		const branchMatch = /^b(\d+)$/u.exec(token);
		if (branchMatch) {
			const condition = asRecordArray(location.node.conditions)[Number(branchMatch[1])];
			if (!condition) return undefined;
			container = asMutableArray(condition.enfants);
			continue;
		}
		return undefined;
	}
	return location;
}

function asMutableArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

function asRecordArray(value: unknown): JsonRecord[] {
	return Array.isArray(value) ? value.filter(isRecord) : [];
}

function isDictionary(value: unknown): boolean {
	return isRecord(value) && value.typeElement === "DictionnaireDonnee";
}

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
