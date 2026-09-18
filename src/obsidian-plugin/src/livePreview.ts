import { syntaxTree } from "@codemirror/language";
import {
	Prec,
	RangeSetBuilder,
	type Extension,
} from "@codemirror/state";
import {
	Decoration,
	type DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import {
	editorInfoField,
	editorLivePreviewField,
	TFile,
	type App,
} from "obsidian";
import { findAlgorithmEmbeds, targetFromRenderedEmbed } from "./document";
import type { PreviewService } from "./PreviewService";

export function createAlgoForgeLivePreviewExtension(
	app: App,
	previews: PreviewService,
): Extension {
	return Prec.highest(ViewPlugin.fromClass(class {
		decorations: DecorationSet;
		private readonly observer: MutationObserver;
		private readonly mounts = new Map<HTMLElement, { dispose: () => void; target: string }>();

		constructor(view: EditorView) {
			this.decorations = buildDecorations(view, app, previews);
			this.observer = new MutationObserver(() => this.enhanceGenericEmbeds(view));
			this.observer.observe(view.dom, { childList: true, subtree: true, attributes: true, characterData: true });
			queueMicrotask(() => this.enhanceGenericEmbeds(view));
		}

		update(update: ViewUpdate): void {
			if (update.docChanged || update.viewportChanged || update.selectionSet) {
				this.decorations = buildDecorations(update.view, app, previews);
			}
			queueMicrotask(() => this.enhanceGenericEmbeds(update.view));
		}

		destroy(): void {
			this.observer.disconnect();
			for (const { dispose } of this.mounts.values()) dispose();
			this.mounts.clear();
		}

		private enhanceGenericEmbeds(view: EditorView): void {
			for (const [element, { dispose }] of this.mounts) {
				if (!view.dom.contains(element)) {
					dispose();
					this.mounts.delete(element);
				}
			}
			if (!view.state.field(editorLivePreviewField, false)) return;
			const info = view.state.field(editorInfoField, false);
			const sourcePath = info?.file?.path ?? "";
			const touchedTargets = new Set(
				findAlgorithmEmbeds(view.state.doc.toString())
					.filter((match) => selectionTouches(view, match.from, match.to))
					.map((match) => match.target),
			);
			const selector = ".internal-embed, .file-embed, .mod-generic, [data-href], .algoforge-live-preview";
			const candidates = Array.from(view.dom.querySelectorAll<HTMLElement>(selector));
			const roots = candidates.map((candidate) =>
				candidate.closest<HTMLElement>(".internal-embed") ?? candidate.closest<HTMLElement>(".file-embed") ?? candidate.closest<HTMLElement>(".mod-generic") ?? candidate);
			for (const element of new Set(roots)) {
				const linked = [element, ...Array.from(element.querySelectorAll<HTMLElement>("[src], [data-href], [href]"))];
				const target = element.dataset.algoforgeTarget ?? targetFromRenderedEmbed(
					linked.flatMap((node) => [node.getAttribute("src"), node.getAttribute("data-href"), node.getAttribute("href")]),
					element.textContent,
				);
				if (!target) continue;
				if (touchedTargets.has(target)) {
					element.style.display = "none";
					continue;
				}
				element.style.removeProperty("display");
				if (this.mounts.has(element)) continue;
				element.dataset.algoforgeTarget = target;
				element.dataset.algoforgeLiveEmbed = "true";
				for (const className of ["internal-embed", "file-embed", "media-embed", "mod-generic", "is-loaded"]) {
					element.removeClass(className);
				}
				element.removeAttribute("src");
				element.removeAttribute("data-href");
				element.addClass("algoforge-live-preview");
				element.empty();
				const file = app.metadataCache.getFirstLinkpathDest(target, sourcePath);
				if (!(file instanceof TFile)) {
					element.createSpan({ cls: "algoforge-preview-error", text: `AlgoForge file not found: ${target}` });
					this.mounts.set(element, { dispose: () => undefined, target });
					continue;
				}
				this.mounts.set(element, { dispose: previews.mount(element, file), target });
			}
		}
	}, { decorations: (value) => value.decorations }));
}

function buildDecorations(view: EditorView, app: App, previews: PreviewService): DecorationSet {
	if (!view.state.field(editorLivePreviewField, false)) return Decoration.none;
	const info = view.state.field(editorInfoField, false);
	const sourcePath = info?.file?.path ?? "";
	const builder = new RangeSetBuilder<Decoration>();
	for (const range of view.visibleRanges) {
		const text = view.state.doc.sliceString(range.from, range.to);
		for (const match of findAlgorithmEmbeds(text, range.from)) {
			if (selectionTouches(view, match.from, match.to) || isInsideCode(view, match.from)) continue;
			builder.add(match.from, match.to, Decoration.replace({
				widget: new AlgoForgeWidget(app, previews, sourcePath, match.target),
			}));
		}
	}
	return builder.finish();
}

function selectionTouches(view: EditorView, from: number, to: number): boolean {
	return view.state.selection.ranges.some((range) =>
		range.empty ? range.from >= from && range.from < to : range.from < to && range.to > from);
}

function isInsideCode(view: EditorView, position: number): boolean {
	let node = syntaxTree(view.state).resolveInner(position, 1);
	while (node) {
		if (/code/i.test(node.name)) return true;
		if (!node.parent) break;
		node = node.parent;
	}
	return false;
}

class AlgoForgeWidget extends WidgetType {
	private dispose: (() => void) | undefined;
	constructor(
		private readonly app: App,
		private readonly previews: PreviewService,
		private readonly sourcePath: string,
		private readonly target: string,
	) { super(); }

	eq(other: AlgoForgeWidget): boolean {
		return this.sourcePath === other.sourcePath && this.target === other.target;
	}

	toDOM(view: EditorView): HTMLElement {
		const container = view.dom.ownerDocument.createElement("span");
		container.className = "algoforge-live-preview";
		const file = this.app.metadataCache.getFirstLinkpathDest(this.target, this.sourcePath);
		if (!(file instanceof TFile)) {
			container.createSpan({ cls: "algoforge-preview-error", text: `AlgoForge file not found: ${this.target}` });
			return container;
		}
		this.dispose = this.previews.mount(container, file);
		return container;
	}

	destroy(): void { this.dispose?.(); }
	ignoreEvent(): boolean { return false; }
}
