import { captureEditorAnalysis } from "./domAdapter";
import { analyzeAlgorithm } from "./engine";
import { normalizeAssignment, normalizeComparison } from "./parser";
import { ANOMALY_STYLES } from "./styles";
import { replaceIfWithSwitch, runDocumentTransaction, type UndoableEditor } from "./transactions";
import type { AnalysisResult, AnomalyFinding, AnomalySeverity, DomAnalysisCapture } from "./types";

interface SelectionLike {
	deselectionnerTout(): void;
	selectionnerElement(element: HTMLElement): void;
}

interface EditorLike extends HTMLElement, UndoableEditor {
	_espacePrincipal?: HTMLElement;
	_planActif?: HTMLElement;
	_selection?: SelectionLike;
	prettifyPlanActif(options?: { enregistrerEvenement?: boolean }): void;
}

interface EditableElement extends HTMLElement {
	_libelle?: string;
	libelle?: string;
	_structure?: HTMLElement;
}

interface ClosablePanel extends Element {
	fermer?(): void;
}

type FindingFilter = "all" | AnomalySeverity;

let activeController: AnomalyController | undefined;

export function initializeAnomalyDetection(editor: EditorLike): void {
	setAnomalyDetectionEnabled(editor, true);
}

export function setAnomalyDetectionEnabled(editor: EditorLike, enabled: boolean): void {
	if (enabled) {
		if (activeController) return;
		activeController = new AnomalyController(editor);
		activeController.initialize();
		return;
	}
	activeController?.destroy();
	activeController = undefined;
}

class AnomalyController {
	private active = false;
	private capture: DomAnalysisCapture | undefined;
	private result: AnalysisResult = { findings: [], failures: [] };
	private filter: FindingFilter = "all";
	private scanVersion = 0;
	private debounceTimer: ReturnType<typeof setTimeout> | undefined;
	private highlightTimer: ReturnType<typeof setTimeout> | undefined;
	private readonly events = new AbortController();
	private style: HTMLStyleElement | undefined;
	private readonly button = this.createToolbarButton();
	private readonly drawer = this.createDrawer();
	private readonly list = this.drawer.querySelector<HTMLElement>(".anomaly-list")!;
	private readonly status = this.drawer.querySelector<HTMLElement>(".anomaly-status")!;

	constructor(private readonly editor: EditorLike) {}

	initialize(): void {
		if (document.getElementById("anomaly_btn")) return;
		this.active = true;
		this.style = document.createElement("style");
		this.style.dataset.feature = "anomaly-detection";
		this.style.textContent = ANOMALY_STYLES;
		document.head.append(this.style);
		document.getElementById("dicobiblioControl")?.prepend(this.button);
		(document.getElementById("espacePrincipal_wrapper") ?? this.editor).append(this.drawer);
		this.bindEvents();
		this.scanImmediately();
	}

	destroy(): void {
		this.active = false;
		this.scanVersion++;
		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		if (this.highlightTimer) clearTimeout(this.highlightTimer);
		this.events.abort();
		this.clearHighlights();
		this.capture = undefined;
		this.result = { findings: [], failures: [] };
		this.button.remove();
		this.drawer.remove();
		this.style?.remove();
	}

	private bindEvents(): void {
		const signal = this.events.signal;
		this.button.addEventListener("click", () => this.toggleDrawer(), { signal });
		this.drawer.querySelector<HTMLButtonElement>(".anomaly-close")?.addEventListener("click", () => this.closeDrawer(), { signal });
		this.drawer.querySelectorAll<HTMLButtonElement>(".anomaly-filter").forEach((button) => {
			button.addEventListener("click", () => {
				this.filter = (button.dataset.filter ?? "all") as FindingFilter;
				this.drawer.querySelectorAll<HTMLButtonElement>(".anomaly-filter").forEach((candidate) =>
					candidate.setAttribute("aria-pressed", String(candidate === button)),
				);
				this.render();
			}, { signal });
		});
		this.editor.addEventListener("algoforge:document-change", () => this.scheduleScan(), { signal });
		this.editor.addEventListener("input", () => this.scheduleScan(), { capture: true, signal });
		this.editor.addEventListener("change", () => this.scheduleScan(), { capture: true, signal });
		for (const id of ["biblio_btn", "dico_btn"]) {
			document.getElementById(id)?.addEventListener("click", () => {
				if (this.drawer.classList.contains("open")) this.closeDrawer();
			}, { signal });
		}
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && this.drawer.classList.contains("open")) this.closeDrawer();
		}, { signal });
	}

	private scheduleScan(): void {
		if (!this.active) return;
		this.scanVersion++;
		this.setAnalyzing(true);
		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		const version = this.scanVersion;
		this.debounceTimer = setTimeout(() => this.scan(version), 250);
	}

	private scanImmediately(): void {
		if (!this.active) return;
		this.scanVersion++;
		this.setAnalyzing(true);
		this.scan(this.scanVersion);
	}

	private scan(version: number): void {
		queueMicrotask(() => {
			if (!this.active || version !== this.scanVersion) return;
			try {
				const capture = captureEditorAnalysis(this.editor);
				const result = analyzeAlgorithm(capture.snapshot);
				if (!this.active || version !== this.scanVersion) return;
				this.capture = capture;
				this.result = result;
				for (const failure of result.failures) {
					console.error(`[Anomalies] Échec de la règle ${failure.ruleId}: ${failure.message}`);
				}
			} catch (error) {
				console.error("[Anomalies] Échec de l’analyse", error);
				this.result = { findings: [], failures: [{ ruleId: "magic-input", message: String(error) }] };
			}
			if (!this.active) return;
			this.setAnalyzing(false);
			this.updateCounts();
			this.render();
		});
	}

	private setAnalyzing(analyzing: boolean): void {
		this.button.classList.toggle("analyzing", analyzing);
		this.button.setAttribute("aria-busy", String(analyzing));
		this.status.textContent = analyzing ? "Analyse en cours…" : "";
	}

	private updateCounts(): void {
		const errors = this.result.findings.filter(({ severity }) => severity === "error").length;
		const warnings = this.result.findings.filter(({ severity }) => severity === "warning").length;
		const errorCount = this.button.querySelector<HTMLElement>(".anomaly-error-count")!;
		const warningCount = this.button.querySelector<HTMLElement>(".anomaly-warning-count")!;
		errorCount.textContent = String(errors);
		warningCount.textContent = String(warnings);
		errorCount.hidden = errors === 0;
		warningCount.hidden = warnings === 0;
		this.button.setAttribute("aria-label", `Anomalies : ${errors} erreurs et ${warnings} avertissements`);
	}

	private render(): void {
		this.list.replaceChildren();
		if (this.result.failures.length) {
			this.status.textContent = `Règles en échec : ${this.result.failures.map((failure) => failure.ruleId).join(", ")}. Les autres résultats restent disponibles.`;
		} else if (!this.button.classList.contains("analyzing")) {
			this.status.textContent = "Analyse mise à jour automatiquement.";
		}
		const visible = this.result.findings.filter(({ severity }) => this.filter === "all" || severity === this.filter);
		if (!visible.length) {
			const empty = document.createElement("p");
			empty.className = "anomaly-empty";
			empty.textContent = "Aucune anomalie dans ce filtre.";
			this.list.append(empty);
			return;
		}
		for (const severity of ["error", "warning"] as const) {
			const findings = visible.filter((finding) => finding.severity === severity);
			if (!findings.length) continue;
			const heading = document.createElement("h3");
			heading.className = "anomaly-severity-title";
			heading.textContent = severity === "error" ? `⛔ Erreurs (${findings.length})` : `⚠ Avertissements (${findings.length})`;
			this.list.append(heading);
			const byRule = new Map<string, AnomalyFinding[]>();
			for (const finding of findings) byRule.set(finding.ruleId, [...(byRule.get(finding.ruleId) ?? []), finding]);
			for (const grouped of byRule.values()) this.renderRuleGroup(grouped);
		}
	}

	private renderRuleGroup(findings: AnomalyFinding[]): void {
		const section = document.createElement("section");
		section.className = "anomaly-rule-group";
		const title = document.createElement("h4");
		title.className = "anomaly-rule-title";
		title.textContent = findings[0]?.title ?? "Anomalie";
		section.append(title);
		for (const finding of findings) section.append(this.createFindingCard(finding));
		this.list.append(section);
	}

	private createFindingCard(finding: AnomalyFinding): HTMLElement {
		const card = document.createElement("article");
		card.className = "anomaly-card";
		card.dataset.severity = finding.severity;
		appendText(card, "h4", finding.message);
		appendText(card, "p", finding.explanation);
		if (finding.evidence) appendText(card, "p", `Constat : ${finding.evidence}`, "anomaly-evidence");
		appendText(card, "p", `Suggestion : ${finding.suggestion}`);
		const actions = document.createElement("div");
		actions.className = "anomaly-actions";
		const navigate = actionButton("Modifier ici", "secondary");
		navigate.addEventListener("click", () => this.navigateTo(finding));
		actions.append(navigate);
		if (finding.fix) {
			const fix = actionButton(finding.fix.label);
			fix.addEventListener("click", () => this.applyFix(finding, fix));
			actions.append(fix);
		}
		card.append(actions);
		return card;
	}

	private navigateTo(finding: AnomalyFinding): void {
		if (!this.capture) return;
		this.clearHighlights();
		const targets = finding.targetPaths
			.map((path) => this.capture?.elements.get(path))
			.filter((element): element is EditableElement => element instanceof HTMLElement);
		const graphicalTargets = targets.map((target) => target._structure ?? target);
		const subplan = graphicalTargets[0]?.closest("sous-plan-travail") as (HTMLElement & { ouvrir?(): void }) | null;
		subplan?.ouvrir?.();
		this.editor._selection?.deselectionnerTout();
		for (const target of graphicalTargets) {
			this.editor._selection?.selectionnerElement(target);
			target.classList.add(`anomaly-target-${finding.severity}`);
		}
		graphicalTargets[0]?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
		this.highlightTimer = setTimeout(() => this.clearHighlights(), 3500);
	}

	private clearHighlights(): void {
		if (this.highlightTimer) clearTimeout(this.highlightTimer);
		this.editor.querySelectorAll(".anomaly-target-error, .anomaly-target-warning").forEach((element) =>
			element.classList.remove("anomaly-target-error", "anomaly-target-warning"),
		);
	}

	private applyFix(original: AnomalyFinding, button: HTMLButtonElement): void {
		const current = this.result.findings.find((finding) => finding.fingerprint === original.fingerprint && finding.fix?.id === original.fix?.id);
		if (!current?.fix || !this.capture) {
			button.disabled = true;
			this.status.textContent = "Ce résultat n’est plus à jour. Nouvelle analyse en cours…";
			this.scanImmediately();
			return;
		}
		if (current.fix.requiresConfirmation) {
			const preview = current.fix.id === "convert-if-to-switch"
				? "Aperçu : la structure SI sera remplacée par un switch, sans modifier le contenu des branches."
				: "Aperçu : les éléments du plan seront automatiquement rapprochés et alignés.";
			if (!window.confirm(`${preview}\n\nCette opération constituera une seule action annulable. Continuer ?`)) return;
		}
		const applied = this.performFix(current);
		if (!applied) {
			button.disabled = true;
			this.status.textContent = "La correction n’est plus applicable. Nouvelle analyse en cours…";
		}
		this.scanImmediately();
	}

	private performFix(finding: AnomalyFinding): boolean {
		const fix = finding.fix;
		const targetPath = finding.targetPaths[0];
		if (!fix || !targetPath || !this.capture) return false;
		if (fix.id === "normalize-assignment" || fix.id === "normalize-comparison" || fix.id === "normalize-switch-case") {
			const element = this.capture.elements.get(targetPath) as EditableElement | undefined;
			if (!element) return false;
			const previous = editableText(element);
			const next = fix.id === "normalize-assignment"
				? normalizeAssignment(previous)
				: fix.id === "normalize-comparison"
					? normalizeComparison(previous)
					: String(fix.payload?.value ?? "");
			if (!next || next === previous) return false;
			setEditableText(element, next);
			this.editor.ajouterEvenement({
				annuler: () => setEditableText(element, previous),
				retablir: () => setEditableText(element, next),
			});
			return true;
		}
		if (fix.id === "convert-if-to-switch") {
			const variable = String(fix.payload?.variable ?? "");
			const values = fix.payload?.values;
			if (!variable || !Array.isArray(values)) return false;
			return runDocumentTransaction(this.editor, "Transformer le SI en switch", (document) =>
				replaceIfWithSwitch(document, targetPath, variable, values),
			);
		}
		if (fix.id === "prettify-plan") {
			const planPath = String(fix.payload?.planPath ?? "");
			const plan = this.capture.plans.get(planPath) as (HTMLElement & { ouvrir?(): void }) | undefined;
			if (!plan) return false;
			plan.ouvrir?.();
			const before = structuredClone(this.editor.serializeDocument());
			this.editor.prettifyPlanActif({ enregistrerEvenement: false });
			const after = structuredClone(this.editor.serializeDocument());
			if (JSON.stringify(before) === JSON.stringify(after)) return false;
			this.editor.ajouterEvenement({
				annuler: () => this.editor.applyDocumentSnapshot(structuredClone(before)),
				retablir: () => this.editor.applyDocumentSnapshot(structuredClone(after)),
			});
			return true;
		}
		return false;
	}

	private toggleDrawer(): void {
		if (this.drawer.classList.contains("open")) this.closeDrawer();
		else this.openDrawer();
	}

	private openDrawer(): void {
		for (const selector of ["bibliotheque-algorithmique", "dictionnaire-donnee"]) {
			try { (document.querySelector(selector) as ClosablePanel | null)?.fermer?.(); }
			catch (error) { console.warn("[Anomalies] Impossible de fermer " + selector, error); }
		}
		this.drawer.classList.add("open");
		this.button.setAttribute("aria-expanded", "true");
		this.drawer.querySelector<HTMLButtonElement>(".anomaly-close")?.focus();
	}

	private closeDrawer(): void {
		this.drawer.classList.remove("open");
		this.button.setAttribute("aria-expanded", "false");
		this.button.focus();
	}

	private createToolbarButton(): HTMLButtonElement {
		const button = document.createElement("button");
		button.id = "anomaly_btn";
		button.type = "button";
		button.dataset.title = "Anomalies de conception";
		button.setAttribute("aria-controls", "anomaly_wrapper");
		button.setAttribute("aria-expanded", "false");
		button.setAttribute("aria-label", "Anomalies : analyse en cours");
		const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		icon.classList.add("anomaly-icon");
		icon.setAttribute("viewBox", "0 0 24 24");
		icon.setAttribute("aria-hidden", "true");
		const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
		iconPath.setAttribute("d", "M12 2.25c.54 0 1.04.29 1.31.76l9.26 16.04A1.51 1.51 0 0 1 21.26 21H2.74a1.51 1.51 0 0 1-1.31-2.26L10.69 3c.27-.47.77-.76 1.31-.76Zm0 2.56L3.65 19.25h16.7L12 4.81Zm-1 4.44h2v5.5h-2v-5.5Zm0 7.25h2v2h-2v-2Z");
		icon.append(iconPath);
		const counts = document.createElement("span");
		counts.className = "anomaly-counts";
		const errorCount = document.createElement("span");
		errorCount.className = "anomaly-count anomaly-error-count";
		errorCount.textContent = "0";
		errorCount.hidden = true;
		const warningCount = document.createElement("span");
		warningCount.className = "anomaly-count anomaly-warning-count";
		warningCount.textContent = "0";
		warningCount.hidden = true;
		counts.append(errorCount, warningCount);
		button.append(icon, counts);
		return button;
	}

	private createDrawer(): HTMLElement {
		const drawer = document.createElement("aside");
		drawer.id = "anomaly_wrapper";
		drawer.setAttribute("aria-label", "Anomalies de conception");
		drawer.innerHTML = `
			<div class="anomaly-header"><h2>Anomalies de conception</h2><button type="button" class="anomaly-close" aria-label="Fermer les anomalies">✕</button></div>
			<div class="anomaly-filters" role="group" aria-label="Filtrer les anomalies">
				<button type="button" class="anomaly-filter" data-filter="all" aria-pressed="true">Toutes</button>
				<button type="button" class="anomaly-filter" data-filter="error" aria-pressed="false">Erreurs</button>
				<button type="button" class="anomaly-filter" data-filter="warning" aria-pressed="false">Avertissements</button>
			</div>
			<p class="anomaly-status" aria-live="polite"></p>
			<div class="anomaly-list"></div>`;
		return drawer;
	}
}

function editableText(element: EditableElement): string {
	if (element.localName === "condition-element") return element._libelle ?? element.querySelector(".libelle")?.textContent ?? "";
	return element.libelle ?? element._libelle ?? element.textContent ?? "";
}

function setEditableText(element: EditableElement, value: string): void {
	if (element.localName === "condition-element") element._libelle = value;
	else if ("libelle" in element) element.libelle = value;
	else element._libelle = value;
}

function appendText(parent: HTMLElement, tag: "h4" | "p", text: string, className?: string): void {
	const element = document.createElement(tag);
	element.textContent = text;
	if (className) element.className = className;
	parent.append(element);
}

function actionButton(label: string, className = ""): HTMLButtonElement {
	const button = document.createElement("button");
	button.type = "button";
	button.className = `anomaly-action ${className}`.trim();
	button.textContent = label;
	return button;
}
