import {
	Component,
	MarkdownRenderChild,
	TFile,
	type App,
} from "obsidian";
import type { EditorToHostMessage, EmbeddedPreviewTheme } from "../../common/embeddedEditorProtocol";
import { editorHtml, libraryCatalog } from "virtual:algoforge-assets";
import { EditorFrame } from "./EditorFrame";
import { parseAlgorithmDocument } from "./document";

interface CacheEntry { path: string; url: string; }
interface PendingRender {
	resolve(svg: string): void;
	reject(error: Error): void;
}

class WindowRenderer {
	private readonly frame: EditorFrame;
	private readyResolve!: () => void;
	private readonly ready = new Promise<void>((resolve) => { this.readyResolve = resolve; });
	private requestId = 0;
	private readonly pending = new Map<number, PendingRender>();
	private queue = Promise.resolve();

	constructor(document: Document) {
		const host = document.body.createDiv({ cls: "algoforge-renderer-host" });
		this.frame = new EditorFrame(host, editorHtml, (message) => this.onMessage(message), "algoforge-renderer-frame");
	}

	render(algorithm: unknown[], title: string, theme: EmbeddedPreviewTheme): Promise<string> {
		const task = this.queue.then(async () => {
			await withTimeout(this.ready, 15_000, "The preview renderer did not start.");
			const requestId = ++this.requestId;
			const response = new Promise<string>((resolve, reject) => {
				this.pending.set(requestId, { resolve, reject });
				this.frame.post({ type: "renderPreview", requestId, algorithm, title, theme });
			});
			return withTimeout(response, 20_000, "The preview renderer did not finish.")
				.finally(() => this.pending.delete(requestId));
		});
		this.queue = task.then(() => undefined, () => undefined);
		return task;
	}

	destroy(): void {
		for (const pending of this.pending.values()) pending.reject(new Error("Preview renderer stopped."));
		this.pending.clear();
		const host = this.frame.iframe.parentElement;
		this.frame.destroy();
		host?.remove();
	}

	private onMessage(message: EditorToHostMessage): void {
		if (message.type === "ready") {
			this.frame.post({
				type: "initialize",
				algorithm: [],
				title: "Preview renderer",
				version: 0,
				library: libraryCatalog as never[],
				customLibrary: [],
				preferences: { theme: "Thème AlgoForge", glow: false },
				capabilities: { undoRedo: "editor" },
			});
			this.readyResolve();
			return;
		}
		if (message.type !== "previewRendered") return;
		const pending = this.pending.get(message.requestId);
		if (!pending) return;
		this.pending.delete(message.requestId);
		if (message.svg) pending.resolve(message.svg);
		else pending.reject(new Error(message.error ?? "Unable to render the algorithm preview."));
	}
}

export class PreviewService {
	private readonly renderers = new Map<Document, WindowRenderer>();
	private readonly cache = new Map<string, CacheEntry>();
	private readonly inflight = new Map<string, Promise<string>>();
	private readonly listeners = new Map<string, Set<() => void>>();

	constructor(
		private readonly app: App,
		private readonly openFile: (file: TFile, event: MouseEvent) => void,
	) {}

	async getPreview(file: TFile, document: Document): Promise<string> {
		const text = await this.app.vault.cachedRead(file);
		const parsed = parseAlgorithmDocument(text);
		if (!parsed.ok) throw new Error(parsed.error);
		const theme = previewTheme(document);
		const themeKey = [theme.background, theme.foreground, theme.border].join(":");
		const key = [file.path, file.stat.mtime, parsed.formatVersion, 2, themeKey].join(":");
		const cached = this.cache.get(key);
		if (cached) return cached.url;
		const pending = this.inflight.get(key);
		if (pending) return pending;
		const task = (async () => {
			let renderer = this.renderers.get(document);
			if (!renderer) {
				renderer = new WindowRenderer(document);
				this.renderers.set(document, renderer);
			}
			let svg: string;
			try {
				svg = await renderer.render(parsed.algorithm, file.basename, theme);
			} catch (error) {
				if (this.renderers.get(document) === renderer) {
					this.renderers.delete(document);
					renderer.destroy();
				}
				throw error;
			}
			const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
			this.cache.set(key, { path: file.path, url });
			return url;
		})();
		this.inflight.set(key, task);
		try { return await task; } finally { this.inflight.delete(key); }
	}

	mount(container: HTMLElement, file: TFile): () => void {
		let disposed = false;
		let sequence = 0;
		container.addClass("algoforge-preview");
		const render = async (): Promise<void> => {
			const current = ++sequence;
			container.empty();
			container.createDiv({ cls: "algoforge-preview-status", text: `Loading ${file.name}…` });
			try {
				const url = await this.getPreview(file, container.ownerDocument);
				if (disposed || current !== sequence) return;
				container.empty();
				const button = container.createEl("button", { cls: "algoforge-preview-button" });
				button.setAttribute("aria-label", `Open ${file.basename} in AlgoForge`);
				button.createEl("img", { attr: { src: url, alt: `AlgoForge algorithm: ${file.basename}` } });
				button.addEventListener("click", (event) => this.openFile(file, event));
			} catch (error) {
				if (disposed || current !== sequence) return;
				container.empty();
				container.createDiv({
					cls: "algoforge-preview-error",
					text: error instanceof Error ? error.message : "Unable to render this AlgoForge file.",
				});
			}
		};
		let subscribedPath = "";
		let unsubscribe = (): void => undefined;
		const subscribeAtCurrentPath = (): void => {
			if (subscribedPath === file.path) return;
			unsubscribe();
			subscribedPath = file.path;
			unsubscribe = this.subscribe(subscribedPath, () => {
				subscribeAtCurrentPath();
				void render();
			});
		};
		subscribeAtCurrentPath();
		void render();
		return () => { disposed = true; unsubscribe(); container.empty(); };
	}

	invalidate(path: string, nextPath?: string): void {
		for (const [key, cached] of this.cache) {
			if (cached.path !== path) continue;
			URL.revokeObjectURL(cached.url);
			this.cache.delete(key);
		}
		for (const listener of this.listeners.get(path) ?? []) listener();
		if (nextPath && nextPath !== path) for (const listener of this.listeners.get(nextPath) ?? []) listener();
	}

	invalidateAll(): void {
		for (const entry of this.cache.values()) URL.revokeObjectURL(entry.url);
		this.cache.clear();
		for (const listeners of this.listeners.values()) {
			for (const listener of listeners) listener();
		}
	}

	destroy(): void {
		for (const entry of this.cache.values()) URL.revokeObjectURL(entry.url);
		this.cache.clear();
		this.inflight.clear();
		for (const renderer of this.renderers.values()) renderer.destroy();
		this.renderers.clear();
		this.listeners.clear();
	}

	private subscribe(path: string, listener: () => void): () => void {
		let listeners = this.listeners.get(path);
		if (!listeners) this.listeners.set(path, listeners = new Set());
		listeners.add(listener);
		return () => {
			listeners?.delete(listener);
			if (listeners?.size === 0) {
				for (const [key, value] of this.listeners) {
					if (value === listeners) this.listeners.delete(key);
				}
			}
		};
	}
}

function previewTheme(document: Document): EmbeddedPreviewTheme {
	const view = document.defaultView ?? window;
	const styles = view.getComputedStyle(document.body);
	const read = (name: string, fallback: string): string => styles.getPropertyValue(name).trim() || fallback;
	const dark = document.body.classList.contains("theme-dark");
	return {
		background: read("--background-primary", dark ? "#1e1e1e" : "#ffffff"),
		foreground: read("--text-normal", dark ? "#dcddde" : "#222222"),
		border: read("--background-modifier-border", dark ? "#4a4a4a" : "#838787"),
	};
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = globalThis.setTimeout(() => reject(new Error(message)), milliseconds);
		promise.then(
			(value) => { globalThis.clearTimeout(timer); resolve(value); },
			(error: unknown) => { globalThis.clearTimeout(timer); reject(error); },
		);
	});
}

export class AlgoForgePreviewChild extends MarkdownRenderChild {
	private disposePreview: (() => void) | undefined;
	constructor(container: HTMLElement, private readonly previews: PreviewService, private readonly file: TFile) {
		super(container);
	}
	onload(): void { this.disposePreview = this.previews.mount(this.containerEl, this.file); }
	onunload(): void { this.disposePreview?.(); }
}

export class AlgoForgePreviewComponent extends Component {
	private disposePreview: (() => void) | undefined;
	constructor(private readonly container: HTMLElement, private readonly previews: PreviewService, private readonly file: TFile) { super(); }
	onload(): void { this.disposePreview = this.previews.mount(this.container, this.file); }
	onunload(): void { this.disposePreview?.(); }
}
