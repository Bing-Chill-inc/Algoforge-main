import {
	areTypesCompatible,
	dictionaryTypeToInferred,
	extractIdentifiers,
	inferLiteralType,
	parseAssignment,
	parseCondition,
	type InferredType,
} from "./parser";
import type {
	AnalysisContext,
	AnalysisFailure,
	AnalysisNode,
	AnalysisPath,
	AnalysisResult,
	AnalysisSequence,
	AnalysisSnapshot,
	AnomalyFinding,
	AnomalyRuleId,
	AnomalySeverity,
	FixDescriptor,
} from "./types";

interface IndexedNode {
	readonly node: AnalysisNode;
	readonly sequence: AnalysisSequence;
	readonly index: number;
	readonly ancestors: readonly AnalysisNode[];
	readonly loops: readonly AnalysisNode[];
	readonly inAlternative: boolean;
}

interface AnalysisState {
	readonly snapshot: AnalysisSnapshot;
	readonly indexed: readonly IndexedNode[];
	readonly byPath: ReadonlyMap<AnalysisPath, IndexedNode>;
	readonly availableBefore: ReadonlyMap<AnalysisPath, ReadonlySet<string>>;
	readonly rootNodePaths: ReadonlySet<AnalysisPath>;
	readonly knownSymbols: readonly string[];
}

interface RuleDefinition {
	readonly id: AnomalyRuleId;
	readonly severity: AnomalySeverity;
	readonly title: string;
	readonly run: (state: AnalysisState) => AnomalyFinding[];
}

const RULES: readonly RuleDefinition[] = [
	rule("magic-input", "error", "Donnée magique", findMagicInputs),
	rule("unused-input", "error", "Donnée inutilisée", findUnusedInputs),
	rule("unused-output", "error", "Résultat inutilisé", findUnusedOutputs),
	rule("magic-variable", "error", "Variable magique", findMagicVariables),
	rule("exit-outside-loop", "error", "Arrêt hors itération", findExitsOutsideLoops),
	rule("exit-in-bounded-loop", "error", "Arrêt dans une itération bornée", findExitsInBoundedLoops),
	rule("unreachable-after-exit", "warning", "Éléments jamais exécutés", findUnreachableNodes),
	rule("invalid-comparison-syntax", "error", "Syntaxe de comparaison incorrecte", findInvalidComparisons),
	rule("invalid-assignment-syntax", "error", "Syntaxe d’affectation incorrecte", findInvalidAssignments),
	rule("unbounded-loop-without-exit", "error", "Boucle sans sortie", findUnboundedLoopsWithoutExit),
	rule("nonterminating-bounded-loop", "error", "Boucle bornée sans fin", findNonterminatingBoundedLoops),
	rule("too-many-children", "warning", "Trop de sous-éléments", findSequencesWithTooManyChildren),
	rule("plan-too-large", "warning", "Plan trop grand", findOversizedPlans),
	rule("inconsistent-alternative-types", "error", "Types inconsistants", findInconsistentAlternativeTypes),
	rule("inconsistent-if-information", "warning", "Informations inconsistantes", findInconsistentIfInformation),
	rule("switch-case-comparison", "error", "Comparaison dans un switch", findSwitchComparisons),
	rule("if-prefer-switch", "warning", "Switch préférable", findIfsBetterAsSwitches),
	rule("dynamic-type", "warning", "Variable dynamiquement typée", findDynamicTypes),
];

export const ANOMALY_RULE_IDS = RULES.map(({ id }) => id);

export function analyzeAlgorithm(snapshot: AnalysisSnapshot, _context: AnalysisContext = {}): AnalysisResult {
	const indexed = indexSnapshot(snapshot.roots);
	const byPath = new Map(indexed.map((entry) => [entry.node.path, entry]));
	const rootNodePaths = new Set(snapshot.roots.nodes.map(({ path }) => path));
	const knownSymbols = collectKnownSymbols(snapshot);
	const availableBefore = calculateAvailability(snapshot.roots, rootNodePaths);
	const state: AnalysisState = { snapshot, indexed, byPath, availableBefore, rootNodePaths, knownSymbols };
	const findings: AnomalyFinding[] = [];
	const failures: AnalysisFailure[] = [];
	for (const definition of RULES) {
		try {
			findings.push(...definition.run(state));
		} catch (error) {
			failures.push({
				ruleId: definition.id,
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}
	const order = new Map(RULES.map((definition, index) => [definition.id, index]));
	findings.sort((left, right) =>
		(order.get(left.ruleId) ?? 0) - (order.get(right.ruleId) ?? 0) ||
		left.targetPaths[0]?.localeCompare(right.targetPaths[0] ?? "") || 0,
	);
	return { findings, failures };
}

function rule(
	id: AnomalyRuleId,
	severity: AnomalySeverity,
	title: string,
	run: RuleDefinition["run"],
): RuleDefinition {
	return { id, severity, title, run };
}

function finding(
	ruleId: AnomalyRuleId,
	targetPaths: readonly AnalysisPath[],
	message: string,
	explanation: string,
	suggestion: string,
	evidence?: string,
	fix?: FixDescriptor,
): AnomalyFinding {
	const definition = RULES.find((candidate) => candidate.id === ruleId);
	if (!definition) throw new Error(`Unknown anomaly rule: ${ruleId}`);
	const fingerprint = [ruleId, ...targetPaths, evidence ?? ""].join("|");
	return {
		fingerprint,
		ruleId,
		severity: definition.severity,
		title: definition.title,
		message,
		explanation,
		evidence,
		suggestion,
		targetPaths,
		fix,
	};
}

function findMagicInputs(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed) {
		if (!isProblem(node) || isIncompleteNode(node) || state.rootNodePaths.has(node.path)) continue;
		const available = state.availableBefore.get(node.path) ?? new Set<string>();
		const missing = node.inputs.filter((name) => !hasName(available, name));
		if (!missing.length) continue;
		result.push(finding(
			"magic-input", [node.path],
			`La donnée ${formatList(missing)} ne provient d’aucun élément précédent.`,
			"Une donnée d’un sous-problème doit être fournie par son contexte ou par un résultat calculé auparavant.",
			"Reliez la donnée à un résultat antérieur ou corrigez l’interface du sous-problème.",
			missing.join(", "),
		));
	}
	return result;
}

function findUnusedInputs(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed) {
		if (!isProblem(node) || isIncompleteNode(node) || !node.inputs.length) continue;
		const references = collectNodeAndDescendantReferences(node, state.knownSymbols);
		const unused = node.inputs.filter((name) => !hasName(references, name));
		if (!unused.length) continue;
		result.push(finding(
			"unused-input", [node.path],
			`La donnée ${formatList(unused)} n’est jamais utilisée.`,
			"L’interface déclare une donnée qui n’est lue ni par ce problème ni par sa décomposition.",
			"Utilisez cette donnée ou retirez-la de l’interface.",
			unused.join(", "),
		));
	}
	return result;
}

function findUnusedOutputs(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const entry of state.indexed) {
		const { node, ancestors } = entry;
		if (!isProblem(node) || isIncompleteNode(node) || state.rootNodePaths.has(node.path) || !node.outputs.length) continue;
		const laterReferences = collectLaterReferences(entry, state.knownSymbols);
		for (const ancestor of ancestors) {
			for (const output of ancestor.outputs) laterReferences.add(normalizeName(output));
		}
		const unused = node.outputs.filter((name) => !hasName(laterReferences, name));
		if (!unused.length) continue;
		result.push(finding(
			"unused-output", [node.path],
			`Le résultat ${formatList(unused)} n’est jamais réutilisé.`,
			"Un résultat intermédiaire doit alimenter une étape suivante ou être propagé par l’interface parente.",
			"Réutilisez ce résultat, propagez-le, ou retirez-le de l’interface.",
			unused.join(", "),
		));
	}
	return result;
}

function findMagicVariables(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed) {
		if (isIncompleteNode(node)) continue;
		const parsedReads = collectDirectReads(node, state.knownSymbols);
		if (!parsedReads.valid) continue;
		const available = new Set(state.availableBefore.get(node.path) ?? []);
		for (const input of node.inputs) available.add(normalizeName(input));
		const assignment = isProblem(node) ? parseAssignment(node.label ?? "", state.knownSymbols) : undefined;
		const missing = parsedReads.identifiers.filter((name) =>
			!hasName(available, name) && normalizeName(name) !== normalizeName(assignment?.lhs ?? ""),
		);
		if (!missing.length) continue;
		result.push(finding(
			"magic-variable", [node.path],
			`La variable ${formatList(missing)} est lue avant d’être définie.`,
			"Le dictionnaire peut documenter une variable, mais une valeur doit être introduite dans le flux de l’algorithme.",
			"Ajoutez une donnée d’entrée, un calcul antérieur ou corrigez le nom utilisé.",
			missing.join(", "),
		));
	}
	return result;
}

function findExitsOutsideLoops(state: AnalysisState): AnomalyFinding[] {
	return state.indexed
		.filter(({ node, loops, inAlternative }) => node.kind === "exit" &&
			(!loops.length || loops.at(-1)?.kind !== "unbounded-loop" || !inAlternative))
		.map(({ node }) => finding(
			"exit-outside-loop", [node.path],
			"Cet arrêt n’appartient pas à une branche d’une boucle non bornée.",
			"Une condition de sortie n’a de sens que dans une alternative contrôlant une boucle non bornée.",
			"Déplacez l’arrêt dans une condition de la boucle concernée.",
		));
}

function findExitsInBoundedLoops(state: AnalysisState): AnomalyFinding[] {
	return state.indexed
		.filter(({ node, loops }) => node.kind === "exit" && loops.at(-1)?.kind === "bounded-loop")
		.map(({ node }) => finding(
			"exit-in-bounded-loop", [node.path],
			"Cet arrêt se trouve dans une boucle déjà bornée.",
			"Les bornes déterminent déjà la terminaison de cette boucle.",
			"Retirez l’arrêt ou utilisez une boucle non bornée si la sortie est conditionnelle.",
		));
}

function findUnreachableNodes(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const sequence of allSequences(state.snapshot.roots)) {
		const exitIndex = sequence.nodes.findIndex(({ kind }) => kind === "exit");
		if (exitIndex < 0 || exitIndex === sequence.nodes.length - 1) continue;
		const targets = sequence.nodes.slice(exitIndex + 1).filter((node) => !isIncompleteNode(node)).map(({ path }) => path);
		if (!targets.length) continue;
		result.push(finding(
			"unreachable-after-exit", targets,
			"Ces éléments ne seront jamais exécutés après l’arrêt.",
			"L’exécution de la branche se termine dès que la condition de sortie est atteinte.",
			"Déplacez ces éléments avant l’arrêt ou dans une autre branche.",
		));
	}
	return result;
}

function findInvalidComparisons(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed.filter(({ node }) => node.kind === "if" || node.kind === "switch")) {
		if (hasIncompleteAlternative(node)) continue;
		for (const sequence of node.sequences) {
			const parsed = parseCondition(sequence.label ?? "", state.knownSymbols);
			if (parsed.isElse || parsed.valid) continue;
			const fix = parsed.usesDoubleEquals ? {
				id: "normalize-comparison" as const,
				label: "Remplacer == par =",
				requiresConfirmation: false,
			} : undefined;
			result.push(finding(
				"invalid-comparison-syntax", [sequence.path],
				"Cette condition n’utilise pas une syntaxe de comparaison valide.",
				"AlgoForge utilise = pour comparer et ET, OU ou NON pour combiner les expressions.",
				"Corrigez la condition.",
				sequence.label,
				fix,
			));
		}
	}
	return result;
}

function findInvalidAssignments(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed) {
		if (!isProblem(node) || isIncompleteNode(node)) continue;
		const parsed = parseAssignment(node.label ?? "", state.knownSymbols);
		if (!parsed.isAssignment || parsed.valid) continue;
		const fixable = parsed.operator === "=" || parsed.operator === "->";
		result.push(finding(
			"invalid-assignment-syntax", [node.path],
			"Cette affectation doit utiliser la flèche ←.",
			"Le symbole = est réservé aux comparaisons dans le formalisme AlgoForge.",
			"Remplacez l’opérateur par ←.",
			node.label,
			fixable ? { id: "normalize-assignment", label: "Utiliser ←", requiresConfirmation: false } : undefined,
		));
	}
	return result;
}

function findUnboundedLoopsWithoutExit(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const entry of state.indexed.filter(({ node }) => node.kind === "unbounded-loop")) {
		if (isIncompleteNode(entry.node)) continue;
		const hasExit = state.indexed.some((candidate) =>
			candidate.node.kind === "exit" && candidate.loops.at(-1)?.path === entry.node.path && candidate.inAlternative,
		);
		if (hasExit) continue;
		result.push(finding(
			"unbounded-loop-without-exit", [entry.node.path],
			"Cette boucle non bornée ne contient aucune condition de sortie.",
			"Sans arrêt accessible, la boucle ne peut pas se terminer.",
			"Ajoutez une alternative contenant une condition de sortie.",
		));
	}
	return result;
}

function findNonterminatingBoundedLoops(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed.filter(({ node }) => node.kind === "bounded-loop")) {
		const lower = parseStrictNumber(node.lowerBound);
		const upper = parseStrictNumber(node.upperBound);
		const step = parseStrictNumber(node.step);
		if (lower === undefined || upper === undefined || step === undefined) continue;
		const magnitude = Math.abs(step);
		const terminates = magnitude > 0 && (lower === upper || (upper > lower ? node.increasing !== false : node.increasing === false));
		if (terminates) continue;
		result.push(finding(
			"nonterminating-bounded-loop", [node.path],
			"Les bornes, le sens et le pas de cette boucle ne permettent pas d’atteindre la fin.",
			"Un pas nul ou un déplacement opposé à la borne terminale rend la boucle infinie.",
			"Corrigez le pas, le sens ou les bornes de l’itération.",
			`${node.lowerBound} → ${node.upperBound}, pas ${node.step}`,
		));
	}
	return result;
}

function findSequencesWithTooManyChildren(state: AnalysisState): AnomalyFinding[] {
	return allSequences(state.snapshot.roots)
		.map((sequence) => ({ nodes: sequence.nodes.filter((node) => !isIncompleteNode(node)) }))
		.filter(({ nodes }) => nodes.length > 7)
		.map(({ nodes }) => finding(
			"too-many-children", nodes.map(({ path }) => path),
			`Cette décomposition contient ${nodes.length} sous-éléments directs.`,
			"Au-delà de sept étapes, la décomposition devient difficile à lire.",
			"Regroupez les étapes dans des sous-problèmes intermédiaires.",
			String(nodes.length),
		));
}

function findOversizedPlans(state: AnalysisState): AnomalyFinding[] {
	return state.snapshot.layouts
		.filter((layout) => !layout.targetPaths.some((path) => {
			const target = state.byPath.get(path)?.node;
			return target ? isIncompleteNode(target) : false;
		}))
		.filter((layout) => layout.width > layout.viewportWidth || layout.height > layout.viewportHeight)
		.map((layout) => finding(
			"plan-too-large", layout.targetPaths,
			"Ce plan dépasse l’espace visible à 100 %.",
			"Une disposition très étendue rend la lecture et l’export moins prévisibles.",
			"Réorganisez automatiquement le plan ou rapprochez les éléments.",
			`${layout.width.toFixed(1)} × ${layout.height.toFixed(1)}`,
			{ id: "prettify-plan", label: "Réorganiser le plan", requiresConfirmation: true, payload: { planPath: layout.path } },
		));
}

function findInconsistentAlternativeTypes(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed.filter(({ node }) => node.kind === "if" || node.kind === "switch")) {
		if (hasIncompleteAlternative(node)) continue;
		const discriminant = node.kind === "switch" ? node.expression?.trim() : undefined;
		const observed: Array<{ type: InferredType; path: string; value: string; variable?: string }> = [];
		for (const sequence of node.sequences) {
			const parsed = parseCondition(sequence.label ?? "", state.knownSymbols);
			if (!parsed.valid || parsed.isElse) continue;
			if (node.kind === "switch") {
				observed.push({ type: inferLiteralType(sequence.label), path: sequence.path, value: sequence.label ?? "", variable: discriminant });
			} else {
				for (const comparison of parsed.comparisons) {
					observed.push({ type: comparison.rightType, path: sequence.path, value: comparison.right, variable: comparison.left.trim() });
				}
			}
		}
		const groups = new Map<string, typeof observed>();
		for (const item of observed) {
			const key = normalizeName(item.variable ?? "");
			if (!key) continue;
			groups.set(key, [...(groups.get(key) ?? []), item]);
		}
		for (const [variable, items] of groups) {
			const known = items.filter(({ type }) => type !== "unknown");
			const declared = dictionaryTypeToInferred(dictionaryType(state.snapshot, variable));
			const inconsistent = known.some(({ type }) => !areTypesCompatible(type, known[0]?.type ?? "unknown") || !areTypesCompatible(type, declared));
			if (!inconsistent) continue;
			result.push(finding(
				"inconsistent-alternative-types", items.map(({ path }) => path),
				`Les valeurs comparées à ${variable} n’ont pas des types compatibles.`,
				"Toutes les alternatives portant sur une même information doivent employer des valeurs compatibles.",
				"Corrigez les valeurs ou le type déclaré dans le dictionnaire.",
				items.map(({ value, type }) => `${value} (${type})`).join(", "),
			));
		}
	}
	return result;
}

function findInconsistentIfInformation(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed.filter(({ node }) => node.kind === "if")) {
		if (hasIncompleteAlternative(node)) continue;
		const branches = node.sequences
			.map((sequence) => ({ sequence, parsed: parseCondition(sequence.label ?? "", state.knownSymbols) }))
			.filter(({ parsed }) => parsed.valid && !parsed.isElse);
		if (branches.length < 2) continue;
		let common = referencedConditionInformation(branches[0]?.parsed);
		for (const { parsed } of branches.slice(1)) {
			const identifiers = referencedConditionInformation(parsed);
			common = new Set([...common].filter((identifier) => identifiers.has(identifier)));
		}
		if (common.size) continue;
		result.push(finding(
			"inconsistent-if-information", branches.map(({ sequence }) => sequence.path),
			"Les branches de cette structure ne testent aucune information commune.",
			"Une chaîne SI/SINON SI est généralement destinée à discriminer un même état.",
			"Séparez les tests indépendants ou reformulez les conditions.",
		));
	}
	return result;
}

function referencedConditionInformation(parsed: ReturnType<typeof parseCondition> | undefined): Set<string> {
	if (!parsed) return new Set();
	return new Set([
		...parsed.identifiers,
		...parsed.comparisons.map(({ left }) => left.trim()).filter(Boolean),
	].map(normalizeName));
}

function findSwitchComparisons(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed.filter(({ node }) => node.kind === "switch")) {
		if (hasIncompleteAlternative(node)) continue;
		const normalizedValues = new Set<string>();
		for (const sequence of node.sequences) {
			const parsed = parseCondition(sequence.label ?? "", state.knownSymbols);
			if (parsed.isElse || !parsed.valid) continue;
			const hasComparison = parsed.comparisons.length > 0 || /\b(?:ET|OU)\b|&&|\|\|/iu.test(sequence.label ?? "");
			if (!hasComparison) {
				normalizedValues.add(normalizeName(sequence.label ?? ""));
				continue;
			}
			const simple = parsed.comparisons.length === 1 && parsed.comparisons[0]?.operator === "=" &&
				normalizeName(parsed.comparisons[0].left) === normalizeName(node.expression ?? "") &&
				!normalizedValues.has(normalizeName(parsed.comparisons[0].right));
			result.push(finding(
				"switch-case-comparison", [sequence.path],
				"Un cas de switch doit contenir une valeur, pas une comparaison.",
				"L’expression à tester est déjà portée par le switch.",
				"Conservez uniquement la valeur du cas.",
				sequence.label,
				simple ? {
					id: "normalize-switch-case",
					label: "Conserver la valeur du cas",
					requiresConfirmation: false,
					payload: { value: parsed.comparisons[0].right },
				} : undefined,
			));
		}
	}
	return result;
}

function findIfsBetterAsSwitches(state: AnalysisState): AnomalyFinding[] {
	const result: AnomalyFinding[] = [];
	for (const { node } of state.indexed.filter(({ node }) => node.kind === "if")) {
		if (hasIncompleteAlternative(node)) continue;
		const candidates = node.sequences.map((sequence) => ({
			sequence,
			parsed: parseCondition(sequence.label ?? "", state.knownSymbols),
		}));
		const nonElse = candidates.filter(({ parsed }) => !parsed.isElse);
		if (nonElse.length < 3 || candidates.some(({ parsed }) => !parsed.valid)) continue;
		const comparisons = nonElse.map(({ parsed }) => parsed.comparisons[0]);
		if (comparisons.some((comparison, index) => !comparison || comparison.operator !== "=" ||
			nonElse[index]?.parsed.comparisons.length !== 1 || comparison.rightType === "unknown")) continue;
		const variable = comparisons[0]?.left.trim() ?? "";
		const values = comparisons.map(({ right }) => right.trim());
		if (!variable || comparisons.some(({ left }) => normalizeName(left) !== normalizeName(variable)) ||
			new Set(values.map(normalizeName)).size !== values.length) continue;
		result.push(finding(
			"if-prefer-switch", [node.path],
			"Cette structure SI serait plus lisible sous forme de switch.",
			"Au moins trois branches comparent la même expression à des valeurs distinctes.",
			"Transformez la structure en switch.",
			`${variable}: ${values.join(", ")}`,
			{
				id: "convert-if-to-switch",
				label: "Transformer en switch",
				requiresConfirmation: true,
				payload: { variable, values },
			},
		));
	}
	return result;
}

function findDynamicTypes(state: AnalysisState): AnomalyFinding[] {
	const assignments = new Map<string, Array<{ path: string; type: InferredType; value: string }>>();
	for (const { node } of state.indexed.filter(({ node }) => isProblem(node))) {
		if (isIncompleteNode(node)) continue;
		const parsed = parseAssignment(node.label ?? "", state.knownSymbols);
		if (!parsed.isAssignment || !parsed.valid || !parsed.lhs || parsed.inferredType === "unknown") continue;
		const key = normalizeName(parsed.lhs);
		assignments.set(key, [...(assignments.get(key) ?? []), {
			path: node.path,
			type: parsed.inferredType,
			value: parsed.rhs ?? "",
		}]);
	}
	const result: AnomalyFinding[] = [];
	for (const [variable, values] of assignments) {
		const declared = dictionaryTypeToInferred(dictionaryType(state.snapshot, variable));
		const inconsistent = values.some(({ type }) =>
			!areTypesCompatible(type, values[0]?.type ?? "unknown") || !areTypesCompatible(type, declared),
		);
		if (!inconsistent) continue;
		result.push(finding(
			"dynamic-type", values.map(({ path }) => path),
			`La variable ${variable} reçoit des valeurs de types incompatibles.`,
			"Une information doit conserver un type compatible pendant toute la conception.",
			"Corrigez les affectations ou le type indiqué dans le dictionnaire.",
			values.map(({ value, type }) => `${value} (${type})`).join(", "),
		));
	}
	return result;
}

function indexSnapshot(roots: AnalysisSequence): IndexedNode[] {
	const result: IndexedNode[] = [];
	const visit = (
		sequence: AnalysisSequence,
		ancestors: readonly AnalysisNode[],
		loops: readonly AnalysisNode[],
		inAlternative: boolean,
	): void => {
		sequence.nodes.forEach((node, index) => {
			const entry: IndexedNode = { node, sequence, index, ancestors, loops, inAlternative };
			result.push(entry);
			const nextLoops = node.kind === "bounded-loop" || node.kind === "unbounded-loop" ? [...loops, node] : loops;
			const isAlternative = node.kind === "if" || node.kind === "switch";
			for (const child of node.sequences) visit(child, [...ancestors, node], nextLoops, inAlternative || isAlternative);
		});
	};
	visit(roots, [], [], false);
	return result;
}

function calculateAvailability(
	roots: AnalysisSequence,
	rootNodePaths: ReadonlySet<string>,
): Map<string, ReadonlySet<string>> {
	const before = new Map<string, ReadonlySet<string>>();
	const walk = (sequence: AnalysisSequence, incoming: ReadonlySet<string>): Set<string> => {
		const available = new Set(incoming);
		for (const node of sequence.nodes) {
			before.set(node.path, new Set(available));
			const childIncoming = new Set(available);
			for (const input of node.inputs) childIncoming.add(normalizeName(input));
			if (node.iterator) childIncoming.add(normalizeName(node.iterator));
			const branchResults = node.sequences.map((child) => walk(child, childIncoming));
			if (node.kind === "if" || node.kind === "switch") {
				if (branchResults.length) {
					const common = new Set(branchResults[0]);
					for (const result of branchResults.slice(1)) {
						for (const name of [...common]) if (!result.has(name)) common.delete(name);
					}
					for (const name of common) available.add(name);
				}
			}
			if (isProblem(node)) {
				for (const output of node.outputs) available.add(normalizeName(output));
				const assignment = parseAssignment(node.label ?? "");
				if (assignment.valid && assignment.lhs) available.add(normalizeName(assignment.lhs));
			}
			if (rootNodePaths.has(node.path)) {
				for (const input of node.inputs) available.add(normalizeName(input));
			}
		}
		return available;
	};
	walk(roots, new Set());
	return before;
}

function collectKnownSymbols(snapshot: AnalysisSnapshot): string[] {
	const result = new Set(Object.keys(snapshot.dictionary).map((name) => name.trim()).filter(Boolean));
	for (const { node } of indexSnapshot(snapshot.roots)) {
		for (const name of [...node.inputs, ...node.outputs]) if (name.trim()) result.add(name.trim());
		if (node.iterator?.trim()) result.add(node.iterator.trim());
		const assignment = parseAssignment(node.label ?? "");
		if (assignment.lhs) result.add(assignment.lhs);
	}
	return [...result];
}

function collectNodeAndDescendantReferences(node: AnalysisNode, known: readonly string[]): Set<string> {
	const result = new Set<string>();
	for (const name of collectDirectReads(node, known).identifiers) result.add(normalizeName(name));
	if (isProblem(node)) {
		const assignment = parseAssignment(node.label ?? "", known);
		if (!assignment.isAssignment) {
			for (const name of extractIdentifiers(node.label ?? "", known)) result.add(normalizeName(name));
		}
		for (const output of node.outputs) result.add(normalizeName(output));
	}
	for (const sequence of node.sequences) {
		if (sequence.label) for (const name of extractIdentifiers(sequence.label, known)) result.add(normalizeName(name));
		for (const child of sequence.nodes) {
			for (const name of collectNodeAndDescendantReferences(child, known)) result.add(name);
		}
	}
	return result;
}

function collectLaterReferences(entry: IndexedNode, known: readonly string[]): Set<string> {
	const result = new Set<string>();
	for (const node of entry.sequence.nodes.slice(entry.index + 1)) {
		for (const input of node.inputs) result.add(normalizeName(input));
		for (const reference of collectNodeAndDescendantReferences(node, known)) result.add(reference);
	}
	return result;
}

function collectDirectReads(node: AnalysisNode, known: readonly string[]): { valid: boolean; identifiers: string[] } {
	if (isProblem(node)) {
		const assignment = parseAssignment(node.label ?? "", known);
		return assignment.isAssignment ? { valid: assignment.valid, identifiers: [...assignment.identifiers] } : { valid: true, identifiers: [] };
	}
	if (node.kind === "switch") {
		return { valid: true, identifiers: expressionReadIdentifiers(node.expression ?? "", known) };
	}
	if (node.kind === "bounded-loop") {
		return {
			valid: true,
			identifiers: extractIdentifiers(`${node.lowerBound ?? ""} ${node.upperBound ?? ""} ${node.step ?? ""}`, known),
		};
	}
	if (node.kind === "if") {
		const parsed = node.sequences.map((sequence) => parseCondition(sequence.label ?? "", known));
		return {
			valid: parsed.every(({ valid, isElse }) => valid || isElse),
			identifiers: parsed.flatMap((condition, index) =>
				conditionReadIdentifiers(node.sequences[index]?.label ?? "", condition, known),
			),
		};
	}
	return { valid: true, identifiers: [] };
}

function conditionReadIdentifiers(
	label: string,
	parsed: ReturnType<typeof parseCondition>,
	known: readonly string[],
): string[] {
	if (parsed.isElse) return [];
	const result = new Set(parsed.identifiers.filter((name) => isKnownSymbol(name, known)));
	if (parsed.comparisons.length) {
		for (const comparison of parsed.comparisons) {
			for (const operand of [comparison.left, comparison.right]) {
				for (const name of expressionReadIdentifiers(operand, known)) result.add(name);
			}
		}
		return [...result];
	}
	for (const operand of label.split(/\b(?:ET|OU)\b|&&|\|\|/iu)) {
		const normalized = operand.replace(/^\s*NON\b/iu, "").replace(/[()]/gu, "").trim();
		for (const name of expressionReadIdentifiers(normalized, known)) result.add(name);
	}
	return [...result];
}

function expressionReadIdentifiers(expression: string, known: readonly string[]): string[] {
	const identifiers = extractIdentifiers(expression, known);
	const result = new Set(identifiers.filter((name) => isKnownSymbol(name, known)));
	const text = expression.trim();
	if (/^[\p{L}_][\p{L}\p{N}_]*$/u.test(text) || /[+\-*/%\[\]]/u.test(text)) {
		for (const name of identifiers) result.add(name);
	}
	return [...result];
}

function isKnownSymbol(name: string, known: readonly string[]): boolean {
	return known.some((symbol) => normalizeName(symbol) === normalizeName(name));
}

function allSequences(root: AnalysisSequence): AnalysisSequence[] {
	const result = [root];
	for (const node of root.nodes) for (const sequence of node.sequences) result.push(...allSequences(sequence));
	return result;
}

function dictionaryType(snapshot: AnalysisSnapshot, name: string): string | undefined {
	const key = Object.keys(snapshot.dictionary).find((candidate) => normalizeName(candidate) === normalizeName(name));
	return key ? snapshot.dictionary[key] : undefined;
}

function isProblem(node: AnalysisNode): boolean {
	return node.kind === "problem" || node.kind === "procedure";
}

function isIncompleteNode(node: AnalysisNode): boolean {
	if (isProblem(node)) return !node.label;
	if (node.kind === "if") return hasIncompleteAlternative(node);
	if (node.kind === "switch") return !node.expression || hasIncompleteAlternative(node);
	if (node.kind === "bounded-loop") {
		return !node.iterator || !node.lowerBound || !node.upperBound || !node.step;
	}
	if (node.kind === "unbounded-loop") {
		return !node.sequences.some((sequence) => sequence.nodes.some((child) => !isIncompleteNode(child)));
	}
	return false;
}

function hasIncompleteAlternative(node: AnalysisNode): boolean {
	return (node.kind === "if" || node.kind === "switch") &&
		(!node.sequences.length || node.sequences.some((sequence) => !sequence.label));
}

function hasName(names: ReadonlySet<string>, name: string): boolean {
	return names.has(normalizeName(name));
}

function normalizeName(value: string): string {
	return value.trim().toLocaleLowerCase();
}

function formatList(values: readonly string[]): string {
	if (values.length <= 1) return `« ${values[0] ?? ""} »`;
	return values.map((value) => `« ${value} »`).join(", ");
}

function parseStrictNumber(value: string | undefined): number | undefined {
	if (!value || !/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/u.test(value.trim())) return undefined;
	const parsed = Number(value.replace(",", "."));
	return Number.isFinite(parsed) ? parsed : undefined;
}
