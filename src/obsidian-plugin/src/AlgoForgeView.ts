import { Notice, TextFileView, type WorkspaceLeaf } from "obsidian";
import type { EditorToHostMessage } from "../../common/embeddedEditorProtocol";
import { editorHtml, libraryCatalog } from "virtual:algoforge-assets";
import { EditorFrame } from "./EditorFrame";
import {
	EMPTY_ALGORITHM,
	parseAlgorithmDocument,
	serializeAlgorithm,
} from "./document";
import type AlgoForgePlugin from "./main";

export const ALGOFORGE_VIEW_TYPE = "algoforge-visual-editor";

export class AlgoForgeView extends TextFileView {
	private frame: EditorFrame | undefined;
	private generation = 0;
	private ready = false;
	private errorEl: HTMLElement | undefined;

	constructor(leaf: WorkspaceLeaf, private readonly plugin: AlgoForgePlugin) {
		super(leaf);
	}

	getViewType(): string { return ALGOFORGE_VIEW_TYPE; }
	getDisplayText(): string { return this.file?.basename ?? "AlgoForge"; }
	getIcon(): string { return "workflow"; }
	getViewData(): string { return this.data; }

	setViewData(data: string, _clear: boolean): void {
		if (data.trim().length === 0) {
			data = serializeAlgorithm([...EMPTY_ALGORITHM]);
			this.data = data;
			this.requestSave();
		} else {
			this.data = data;
		}
		this.generation++;
		this.showCurrentDocument(this.ready ? "replaceDocument" : "initialize");
	}

	clear(): void {
		this.data = "";
		this.generation++;
		this.errorEl?.remove();
		this.errorEl = undefined;
	}

	async onOpen(): Promise<void> {
		await super.onOpen();
		this.contentEl.addClass("algoforge-view");
		this.ensureFrame();
	}

	async onClose(): Promise<void> {
		this.frame?.destroy();
		this.frame = undefined;
		await super.onClose();
	}

	private ensureFrame(): void {
		if (this.frame) return;
		this.frame = new EditorFrame(this.contentEl, editorHtml, (message) => {
			void this.handleMessage(message);
		});
	}

	private showCurrentDocument(type: "initialize" | "replaceDocument"): void {
		const parsed = parseAlgorithmDocument(this.data);
		if (!parsed.ok) {
			this.showError(parsed.error);
			return;
		}
		this.errorEl?.remove();
		this.errorEl = undefined;
		this.frame?.iframe.removeClass("is-hidden");
		if (!this.frame || !this.ready) return;
		this.frame.post({
			type,
			algorithm: parsed.algorithm,
			title: this.file?.basename ?? "Algorithm",
			version: this.generation,
			library: type === "initialize" ? libraryCatalog as never[] : undefined,
			customLibrary: type === "initialize" ? this.plugin.settings.customLibrary : undefined,
			preferences: type === "initialize" ? {
				theme: this.plugin.settings.theme,
				glow: this.plugin.settings.glow,
			} : undefined,
			capabilities: { undoRedo: "editor" },
		});
	}

	private showError(error: string): void {
		this.ensureFrame();
		this.frame?.iframe.addClass("is-hidden");
		this.errorEl?.remove();
		this.errorEl = this.contentEl.createDiv({ cls: "algoforge-error-card" });
		this.errorEl.createEl("h2", { text: "Unable to open this AlgoForge file" });
		this.errorEl.createEl("p", { text: error });
		this.errorEl.createEl("p", { text: "The file has not been changed." });
	}

	private async handleMessage(message: EditorToHostMessage): Promise<void> {
		switch (message.type) {
			case "ready":
				this.ready = true;
				this.showCurrentDocument("initialize");
				return;
			case "documentChanged": {
				const parsed = parseAlgorithmDocument(this.data);
				if (message.baseVersion !== this.generation || !parsed.ok) {
					if (parsed.ok) this.frame?.post({
						type: "editRejected",
						algorithm: parsed.algorithm,
						title: this.file?.basename ?? "Algorithm",
						version: this.generation,
						error: "The file changed before the visual edit could be applied.",
					});
					return;
				}
				const next = serializeAlgorithm(message.algorithm);
				const validation = parseAlgorithmDocument(next);
				if (!validation.ok) throw new Error(validation.error);
				this.data = next;
				this.generation++;
				this.requestSave();
				this.frame?.post({ type: "editAccepted", editId: message.editId, version: this.generation });
				return;
			}
			case "clipboardRead":
				this.frame?.post({ type: "clipboardResult", requestId: message.requestId, text: await navigator.clipboard.readText() });
				return;
			case "clipboardWrite":
				await navigator.clipboard.writeText(message.text);
				return;
			case "command":
				await this.plugin.executeEditorCommand(this, message.command);
				return;
			case "exportFile":
				await this.plugin.exportFile(this, message);
				return;
			case "createImportedDocument":
				await this.plugin.createImportedDocument(this, message.name, message.algorithm);
				return;
			case "customLibrary":
				this.plugin.settings.customLibrary = message.value;
				await this.plugin.saveSettings();
				return;
			case "preference":
				if (message.name === "theme" && typeof message.value === "string") this.plugin.settings.theme = message.value;
				if (message.name === "glow" && typeof message.value === "boolean") this.plugin.settings.glow = message.value;
				await this.plugin.saveSettings();
				return;
			case "openExternal":
				if (/^https?:\/\//i.test(message.href)) window.open(message.href, "_blank", "noopener,noreferrer");
				return;
			case "error":
				new Notice(message.message);
				return;
			case "reopenAsText":
				new Notice("AlgoForge files are opened by the visual editor while the plugin is enabled.");
				return;
			case "previewRendered":
				return;
		}
	}

	sendImport(name: string, content: string): void {
		this.frame?.post({ type: "importSource", name, content });
	}
}
