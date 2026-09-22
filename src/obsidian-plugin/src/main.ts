import {
	Keymap,
	MarkdownRenderChild,
	Notice,
	Plugin,
	TFile,
	TFolder,
	normalizePath,
	type MarkdownPostProcessorContext,
	type PaneType,
} from "obsidian";
import type {
	EditorToHostMessage,
	EmbeddedHostCommand,
} from "../../common/embeddedEditorProtocol";
import {
	AlgoForgeView,
	ALGOFORGE_VIEW_TYPE,
} from "./AlgoForgeView";
import {
	ALGORITHM_EXTENSIONS,
	EMPTY_ALGORITHM,
	IMPORT_EXTENSIONS,
	isAlgorithmExtension,
	normalizeAlgorithmPath,
	parseAlgorithmDocument,
	serializeAlgorithm,
	targetFromRenderedEmbed,
} from "./document";
import { createAlgoForgeLivePreviewExtension } from "./livePreview";
import { FileSuggestModal, PathModal } from "./modals";
import { AlgoForgePreviewChild, PreviewService } from "./PreviewService";

export interface AlgoForgeSettings {
	theme?: string;
	glow?: boolean;
	customLibrary: unknown[];
}

const DEFAULT_SETTINGS: AlgoForgeSettings = {
	theme: "Thème AlgoForge",
	glow: false,
	customLibrary: [],
};

export default class AlgoForgePlugin extends Plugin {
	settings: AlgoForgeSettings = { ...DEFAULT_SETTINGS };
	private previews!: PreviewService;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.previews = new PreviewService(this.app, (file, event) => {
			void this.openAlgorithm(file, Keymap.isModEvent(event));
		});
		this.registerView(ALGOFORGE_VIEW_TYPE, (leaf) => new AlgoForgeView(leaf, this));
		this.registerExtensions(["af", "algoforge"], ALGOFORGE_VIEW_TYPE);
		this.registerMarkdownPostProcessor((element, context) => this.processEmbeds(element, context), 1000);
		this.registerEvent(this.app.workspace.on("file-menu", (menu, file) => {
			menu.addItem((item) => item
				.setTitle("New Algorithm")
				.setIcon("workflow")
				.onClick(() => {
					const folder = file instanceof TFolder ? file.path : file.parent?.path;
					void this.createNewAlgorithmImmediately(folder);
				}));
		}));
		this.registerEvent(this.app.workspace.on("css-change", () => this.previews.invalidateAll()));
		this.registerEditorExtension(createAlgoForgeLivePreviewExtension(this.app, this.previews));
		this.registerEvent(this.app.vault.on("modify", (file) => {
			if (file instanceof TFile && isAlgorithmExtension(file.extension)) this.previews.invalidate(file.path);
		}));
		this.registerEvent(this.app.vault.on("delete", (file) => {
			if (file instanceof TFile && isAlgorithmExtension(file.extension)) this.previews.invalidate(file.path);
		}));
		this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
			if (file instanceof TFile && (isAlgorithmExtension(file.extension) || /\.(?:af|algoforge)$/i.test(oldPath))) {
				this.previews.invalidate(oldPath, file.path);
			}
		}));
		this.addCommand({ id: "new-algorithm", name: "New algorithm", callback: () => { void this.createNewAlgorithm(); } });
		this.addCommand({ id: "open-algorithm", name: "Open algorithm", callback: () => { void this.chooseAndOpenAlgorithm(); } });
	}

	async onunload(): Promise<void> {
		this.previews?.destroy();
	}

	async saveSettings(): Promise<void> { await this.saveData(this.settings); }

	async executeEditorCommand(view: AlgoForgeView, command: EmbeddedHostCommand): Promise<void> {
		try {
			switch (command) {
				case "new": await this.createNewAlgorithm(view.file?.parent?.path); return;
				case "open": await this.chooseAndOpenAlgorithm(); return;
				case "save": await view.save(); return;
				case "saveAs": await this.saveViewAs(view); return;
				case "import": await this.importLegacyFile(view); return;
				case "undo":
				case "redo": return;
			}
		} catch (error) { this.showError(error); }
	}

	async exportFile(
		view: AlgoForgeView,
		message: Extract<EditorToHostMessage, { type: "exportFile" }>,
	): Promise<void> {
		try {
			const initial = this.siblingPath(view.file, sanitizeFilename(message.suggestedName));
			const path = await this.promptPath("Export file", initial, false);
			if (!path) return;
			const bytes = message.encoding === "utf8"
				? new TextEncoder().encode(message.content)
				: decodeDataUrl(message.content);
			await this.app.vault.createBinary(path, Uint8Array.from(bytes).buffer as ArrayBuffer);
			new Notice(`Exported ${path}`);
		} catch (error) { this.showError(error); }
	}

	async createImportedDocument(view: AlgoForgeView, name: string, algorithm: unknown[]): Promise<void> {
		try {
			const filename = `${sanitizeFilename(name || "algorithm").replace(/\.(?:af|algoforge)$/i, "")}.af`;
			const initial = this.siblingPath(view.file, filename);
			const path = await this.promptPath("Create imported algorithm", initial, true);
			if (!path) return;
			const file = await this.app.vault.create(path, serializeAlgorithm(algorithm));
			await this.openAlgorithm(file, false);
		} catch (error) { this.showError(error); }
	}

	private async loadSettings(): Promise<void> {
		const stored = await this.loadData() as Partial<AlgoForgeSettings> | null;
		this.settings = { ...DEFAULT_SETTINGS, ...stored, customLibrary: Array.isArray(stored?.customLibrary) ? stored.customLibrary : [] };
	}

	private processEmbeds(element: HTMLElement, context: MarkdownPostProcessorContext): void {
		const scan = (): void => this.replaceRenderedEmbeds(element, context);
		scan();
		context.addChild(new AlgoForgeEmbedObserverChild(element, scan));
	}

	private replaceRenderedEmbeds(element: HTMLElement, context: MarkdownPostProcessorContext): void {
		const selector = ".internal-embed, .file-embed, .mod-generic, [data-href]";
		const candidates = [
			...(element.matches?.(selector) ? [element] : []),
			...Array.from(element.querySelectorAll<HTMLElement>(selector)),
		];
		const embeds = candidates.map((candidate) =>
			candidate.closest<HTMLElement>(".internal-embed") ?? candidate.closest<HTMLElement>(".file-embed") ?? candidate.closest<HTMLElement>(".mod-generic") ?? candidate);
		for (const embed of new Set(embeds)) {
			if (embed.dataset.algoforgeEmbed === "true") continue;
			const linked = [embed, ...Array.from(embed.querySelectorAll<HTMLElement>("[src], [data-href], [href]"))];
			const target = targetFromRenderedEmbed(
				linked.flatMap((node) => [node.getAttribute("src"), node.getAttribute("data-href"), node.getAttribute("href")]),
				embed.textContent,
			);
			if (!target) continue;
			embed.dataset.algoforgeEmbed = "true";
			for (const className of ["internal-embed", "file-embed", "media-embed", "mod-generic", "is-loaded"]) {
				embed.removeClass(className);
			}
			embed.removeAttribute("src");
			embed.removeAttribute("data-href");
			embed.addClass("algoforge-embed-container");
			const file = this.app.metadataCache.getFirstLinkpathDest(target, context.sourcePath);
			embed.empty();
			if (!(file instanceof TFile)) {
				embed.createDiv({ cls: "algoforge-preview-error", text: `AlgoForge file not found: ${target}` });
				continue;
			}
			context.addChild(new AlgoForgePreviewChild(embed, this.previews, file));
		}
	}

	private async createNewAlgorithmImmediately(parentPath?: string): Promise<void> {
		try {
			const folder = parentPath && parentPath !== "/" ? parentPath : "";
			let suffix = 0;
			let path: string;
			do {
				const filename = suffix === 0 ? "algorithm.af" : `algorithm ${suffix}.af`;
				path = folder ? `${folder}/${filename}` : filename;
				suffix += 1;
			} while (this.app.vault.getAbstractFileByPath(path));
			const file = await this.app.vault.create(path, serializeAlgorithm([...EMPTY_ALGORITHM]));
			await this.openAlgorithm(file, false);
		} catch (error) { this.showError(error); }
	}

	private async createNewAlgorithm(parentPath?: string): Promise<void> {
		try {
			const activeParent = parentPath ?? this.app.workspace.getActiveFile()?.parent?.path ?? "";
			const initial = activeParent ? `${activeParent}/algorithm.af` : "algorithm.af";
			const path = await this.promptPath("Create AlgoForge algorithm", initial, true);
			if (!path) return;
			const file = await this.app.vault.create(path, serializeAlgorithm([...EMPTY_ALGORITHM]));
			await this.openAlgorithm(file, false);
		} catch (error) { this.showError(error); }
	}

	private async chooseAndOpenAlgorithm(): Promise<void> {
		const files = this.app.vault.getFiles().filter((file) => ALGORITHM_EXTENSIONS.has(file.extension.toLowerCase()));
		const modal = new FileSuggestModal(this.app, files, "Choose an AlgoForge file");
		modal.open();
		const file = await modal.result;
		if (file) await this.openAlgorithm(file, false);
	}

	private async saveViewAs(view: AlgoForgeView): Promise<void> {
		const initial = this.siblingPath(view.file, `${view.file?.basename ?? "algorithm"}.af`);
		const path = await this.promptPath("Save AlgoForge algorithm as", initial, true);
		if (!path) return;
		const parsed = parseAlgorithmDocument(view.getViewData());
		if (!parsed.ok) throw new Error(parsed.error);
		const file = await this.app.vault.create(path, serializeAlgorithm(parsed.algorithm));
		await this.openAlgorithm(file, false);
	}

	private async importLegacyFile(view: AlgoForgeView): Promise<void> {
		const files = this.app.vault.getFiles().filter((file) => IMPORT_EXTENSIONS.has(file.extension.toLowerCase()));
		const modal = new FileSuggestModal(this.app, files, "Choose a legacy AlgoForge file");
		modal.open();
		const file = await modal.result;
		if (!file) return;
		view.sendImport(file.name, await this.app.vault.read(file));
	}

	private async openAlgorithm(file: TFile, newLeaf: PaneType | boolean): Promise<void> {
		await this.app.workspace.getLeaf(newLeaf).openFile(file);
	}

	private async promptPath(heading: string, initial: string, algorithm: boolean): Promise<string | undefined> {
		const modal = new PathModal(this.app, heading, initial);
		modal.open();
		const input = await modal.result;
		if (input === undefined) return undefined;
		let path = algorithm ? normalizeAlgorithmPath(input) : normalizeExportPath(input);
		path = normalizePath(path);
		if (this.app.vault.getAbstractFileByPath(path)) throw new Error(`A file already exists at ${path}.`);
		const slash = path.lastIndexOf("/");
		if (slash >= 0) {
			const parent = this.app.vault.getAbstractFileByPath(path.slice(0, slash));
			if (!(parent instanceof TFolder)) throw new Error("The destination folder does not exist.");
		}
		return path;
	}

	private siblingPath(file: TFile | null, filename: string): string {
		const parent = file?.parent?.path;
		return parent ? `${parent}/${filename}` : filename;
	}

	private showError(error: unknown): void {
		new Notice(error instanceof Error ? error.message : String(error));
	}
}

class AlgoForgeEmbedObserverChild extends MarkdownRenderChild {
	private observer: MutationObserver | undefined;

	constructor(container: HTMLElement, private readonly scan: () => void) {
		super(container);
	}

	onload(): void {
		this.observer = new MutationObserver(() => this.scan());
		this.observer.observe(this.containerEl, { childList: true, subtree: true, attributes: true, characterData: true });
		this.scan();
	}

	onunload(): void { this.observer?.disconnect(); }
}

function normalizeExportPath(input: string): string {
	const value = input.trim().replaceAll("\\", "/").replace(/^\/+/, "");
	if (!value || value.split("/").some((part) => !part || part === "." || part === "..")) {
		throw new Error("Enter a valid vault-relative file path.");
	}
	if (/[\u0000-\u001f:*?"<>|]/.test(value)) throw new Error("The path contains invalid characters.");
	return value;
}

function sanitizeFilename(value: string): string {
	return value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim() || "export";
}

function decodeDataUrl(value: string): Uint8Array {
	const match = /^data:[^;,]+(?:;charset=[^;,]+)?;base64,(.*)$/s.exec(value);
	if (!match?.[1]) throw new Error("The editor returned an invalid export.");
	const binary = atob(match[1]);
	return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
