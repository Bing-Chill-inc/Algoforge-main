import { createAnalysisSnapshot } from "./snapshot";
import type {
	AnalysisNode,
	AnalysisPlanLayout,
	AnalysisSequence,
	DomAnalysisCapture,
} from "./types";

interface EditorLike extends HTMLElement {
	serializeDocument(): unknown;
	_espacePrincipal?: HTMLElement;
}

interface LiveNode extends HTMLElement {
	_parent?: unknown;
	_elemParent?: LiveParent;
	_listeConditions?: HTMLElement;
	_sousPlan?: LivePlan | null;
	_abscisse?: string | number;
	_ordonnee?: string | number;
	constructor: Function & { typeElement?: string };
}

interface LiveParent {
	_listeElementsEnfants?: Array<{ element?: LiveNode }>;
}

interface LiveCondition extends HTMLElement {
	_elemParent?: LiveParent;
}

interface LivePlan extends HTMLElement {
	getProblemeLePlusHaut?(): LiveNode | null;
}

/** Capture all mutable DOM knowledge once, leaving the rule engine pure. */
export function captureEditorAnalysis(editor: EditorLike): DomAnalysisCapture {
	const documentJson = editor.serializeDocument();
	const baseSnapshot = createAnalysisSnapshot(documentJson);
	const elements = new Map<string, HTMLElement>();
	const plans = new Map<string, HTMLElement>();
	const mainPlan = editor._espacePrincipal ?? document.querySelector<HTMLElement>("#espacePrincipal");
	if (mainPlan) {
		plans.set(baseSnapshot.roots.path, mainPlan);
		mapSequence(baseSnapshot.roots, rootElements(mainPlan), elements, plans);
	}
	const layouts = captureLayouts(plans, elements);
	return {
		snapshot: createAnalysisSnapshot(documentJson, layouts),
		elements,
		plans,
	};
}

function mapSequence(
	sequence: AnalysisSequence,
	liveNodes: readonly LiveNode[],
	elements: Map<string, HTMLElement>,
	plans: Map<string, HTMLElement>,
): void {
	sequence.nodes.forEach((node, index) => {
		const live = liveNodes[index];
		if (!live) return;
		elements.set(node.path, live);
		mapNodeSequences(node, live, elements, plans);
	});
}

function mapNodeSequences(
	node: AnalysisNode,
	live: LiveNode,
	elements: Map<string, HTMLElement>,
	plans: Map<string, HTMLElement>,
): void {
	if (node.kind === "if" || node.kind === "switch") {
		const conditions = live._listeConditions
			? Array.from(live._listeConditions.children).filter(isHTMLElement) as LiveCondition[]
			: [];
		node.sequences.forEach((sequence, index) => {
			const condition = conditions[index];
			if (!condition) return;
			elements.set(sequence.path, condition);
			mapSequence(sequence, linkedChildren(condition._elemParent), elements, plans);
		});
		return;
	}
	const childSequence = node.sequences[0];
	if (!childSequence) return;
	if (childSequence.path.endsWith("/plan") && live._sousPlan) {
		const top = live._sousPlan.getProblemeLePlusHaut?.();
		plans.set(childSequence.path, live._sousPlan);
		mapSequence(childSequence, linkedChildren(top?._elemParent), elements, plans);
		return;
	}
	mapSequence(childSequence, linkedChildren(live._elemParent), elements, plans);
}

function rootElements(plan: HTMLElement): LiveNode[] {
	return Array.from(plan.children)
		.filter(isLiveNode)
		.filter((element) => element._parent == null);
}

function linkedChildren(parent: LiveParent | undefined): LiveNode[] {
	return (parent?._listeElementsEnfants ?? [])
		.map(({ element }) => element)
		.filter((element): element is LiveNode => Boolean(element));
}

function captureLayouts(
	plans: ReadonlyMap<string, HTMLElement>,
	elements: ReadonlyMap<string, HTMLElement>,
): AnalysisPlanLayout[] {
	const pathByElement = new Map<HTMLElement, string>();
	for (const [path, element] of elements) {
		if (isLiveNode(element)) pathByElement.set(element, path);
	}
	const zoom = Math.max(
		parseFloat(document.body.style.getPropertyValue("--sizeModifier")) || 1,
		0.001,
	);
	return [...plans].map(([path, plan]) => {
		const targets = [...pathByElement]
			.filter(([element]) => element.parentElement === plan)
			.map(([element, targetPath]) => ({ element: element as LiveNode, path: targetPath }));
		const boxes = targets.map(({ element }) => logicalBox(element, zoom));
		const minX = boxes.length ? Math.min(...boxes.map(({ x }) => x)) : 0;
		const minY = boxes.length ? Math.min(...boxes.map(({ y }) => y)) : 0;
		const maxX = boxes.length ? Math.max(...boxes.map(({ x, width }) => x + width)) : 0;
		const maxY = boxes.length ? Math.max(...boxes.map(({ y, height }) => y + height)) : 0;
		return {
			path,
			targetPaths: targets.map((target) => target.path),
			width: Math.max(0, maxX - minX),
			height: Math.max(0, maxY - minY),
			viewportWidth: plan.clientWidth / Math.max(window.innerWidth, 1) * 100 / zoom,
			viewportHeight: plan.clientHeight / Math.max(window.innerWidth, 1) * 100 / zoom,
		};
	});
}

function logicalBox(element: LiveNode, zoom: number): { x: number; y: number; width: number; height: number } {
	const rect = element.getBoundingClientRect();
	return {
		x: parseFloat(String(element._abscisse ?? 0)) || 0,
		y: parseFloat(String(element._ordonnee ?? 0)) || 0,
		width: rect.width > 0 ? rect.width / Math.max(window.innerWidth, 1) * 100 / zoom : 8,
		height: rect.height > 0 ? rect.height / Math.max(window.innerWidth, 1) * 100 / zoom : 4,
	};
}

function isHTMLElement(value: Element): value is HTMLElement {
	return value instanceof HTMLElement;
}

function isLiveNode(value: Element): value is LiveNode {
	return value instanceof HTMLElement && typeof (value.constructor as LiveNode["constructor"]).typeElement === "string";
}
