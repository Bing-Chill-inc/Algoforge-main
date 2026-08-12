import { posix } from "node:path";
import * as vscode from "vscode";
import {
	decodeExportContent,
	EMPTY_ALGORITHM,
	ensureAlgoForgeExtension,
	parseAlgorithmDocument,
	serializeAlgorithm,
	siblingUri,
	titleFromUri,
} from "./document";
import type {
	ExtensionToWebviewMessage,
	WebviewToExtensionMessage,
} from "./protocol";

const CUSTOM_LIBRARY_KEY = "algoforge.customLibrary";
const THEME_KEY = "algoforge.theme";
const GLOW_KEY = "algoforge.glow";
const MAX_IMPORT_SIZE = 5_000_000;

export class AlgoForgeEditorProvider implements vscode.CustomTextEditorProvider {
	static readonly viewType = "algoforge.visualEditor";

	private readonly catalog: Promise<unknown[]>;

	constructor(private readonly context: vscode.ExtensionContext) {
		this.catalog = this.readCatalog();
	}

	static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new AlgoForgeEditorProvider(context);
		return vscode.window.registerCustomEditorProvider(
			AlgoForgeEditorProvider.viewType,
			provider,
			{
				supportsMultipleEditorsPerDocument: false,
				webviewOptions: { retainContextWhenHidden: false },
			},
		);
	}

	async resolveCustomTextEditor(
		document: vscode.TextDocument,
		panel: vscode.WebviewPanel,
	): Promise<void> {
		const webviewRoot = vscode.Uri.joinPath(
			this.context.extensionUri,
			"dist",
			"webview",
		);
		panel.iconPath = {
			light: vscode.Uri.joinPath(
				this.context.extensionUri,
				"dist",
				"media",
				"algoforge-file-light.svg",
			),
			dark: vscode.Uri.joinPath(
				this.context.extensionUri,
				"dist",
				"media",
				"algoforge-file-dark.svg",
			),
		};
		panel.webview.options = {
			enableScripts: true,
			localResourceRoots: [webviewRoot],
		};

		let editorLoaded = false;
		let pendingEdit: { editId: number; text: string } | undefined;

		const showVisualEditor = async (): Promise<void> => {
			panel.webview.html = await this.getEditorHtml(panel.webview, webviewRoot);
			editorLoaded = true;
		};
		const showInvalidDocument = (error: string): void => {
			panel.webview.html = this.getInvalidDocumentHtml(panel.webview, error);
			editorLoaded = false;
		};
		const sendState = async (
			type: "initialize" | "replaceDocument",
		): Promise<void> => {
			const parsed = parseAlgorithmDocument(document.getText());
			if (!parsed.ok) {
				showInvalidDocument(parsed.error);
				return;
			}
			const message: ExtensionToWebviewMessage = {
				type,
				algorithm: parsed.algorithm,
				title: titleFromUri(document.uri),
				version: document.version,
			};
			if (type === "initialize") {
				message.library = (await this.catalog) as never[];
				message.customLibrary =
					this.context.globalState.get<unknown[]>(CUSTOM_LIBRARY_KEY) ?? [];
				message.preferences = {
					theme: this.context.globalState.get<string>(THEME_KEY),
					glow: this.context.globalState.get<boolean>(GLOW_KEY),
				};
			}
			await panel.webview.postMessage(message);
		};
		const rejectWithAuthoritativeState = async (error?: string): Promise<void> => {
			pendingEdit = undefined;
			const parsed = parseAlgorithmDocument(document.getText());
			if (!parsed.ok) {
				showInvalidDocument(parsed.error);
				return;
			}
			await panel.webview.postMessage({
				type: "editRejected",
				algorithm: parsed.algorithm,
				title: titleFromUri(document.uri),
				version: document.version,
				error,
			} satisfies ExtensionToWebviewMessage);
		};

		const messageDisposable = panel.webview.onDidReceiveMessage(
			async (message: WebviewToExtensionMessage) => {
				try {
					switch (message.type) {
						case "ready":
							await sendState("initialize");
							break;
						case "documentChanged": {
							if (message.baseVersion !== document.version) {
								await rejectWithAuthoritativeState(
									"The document changed in VS Code before this visual edit could be applied.",
								);
								break;
							}
							const text = serializeAlgorithm(message.algorithm);
							const parsed = parseAlgorithmDocument(text);
							if (!parsed.ok) throw new Error(parsed.error);
							if (text === document.getText()) {
								await panel.webview.postMessage({
									type: "editAccepted",
									editId: message.editId,
									version: document.version,
								} satisfies ExtensionToWebviewMessage);
								break;
							}
							pendingEdit = { editId: message.editId, text };
							let applied = false;
							try {
								applied = await replaceWholeDocument(document, text);
							} catch (error) {
								await rejectWithAuthoritativeState(toErrorMessage(error));
								break;
							}
							if (!applied) {
								await rejectWithAuthoritativeState(
									"VS Code rejected the AlgoForge document edit.",
								);
							}
							break;
						}
						case "command":
							await this.executeEditorCommand(message.command, document, panel.webview);
							break;
						case "clipboardRead":
							await panel.webview.postMessage({
								type: "clipboardResult",
								requestId: message.requestId,
								text: await vscode.env.clipboard.readText(),
							} satisfies ExtensionToWebviewMessage);
							break;
						case "clipboardWrite":
							await vscode.env.clipboard.writeText(message.text);
							break;
						case "exportFile":
							await this.exportFile(document.uri, message);
							break;
						case "createImportedDocument":
							await this.createImportedDocument(
								document.uri,
								message.name,
								message.algorithm,
							);
							break;
						case "customLibrary":
							await this.context.globalState.update(
								CUSTOM_LIBRARY_KEY,
								message.value,
							);
							break;
						case "preference":
							if (message.name === "theme" && typeof message.value === "string") {
								await this.context.globalState.update(THEME_KEY, message.value);
							}
							if (message.name === "glow" && typeof message.value === "boolean") {
								await this.context.globalState.update(GLOW_KEY, message.value);
							}
							break;
						case "openExternal": {
							const uri = vscode.Uri.parse(message.href);
							if (uri.scheme !== "https" && uri.scheme !== "http") {
								throw new Error("Only HTTP(S) links can be opened.");
							}
							await vscode.env.openExternal(uri);
							break;
						}
						case "error":
							await vscode.window.showErrorMessage(message.message);
							break;
						case "reopenAsText":
							await reopenAsText(document.uri);
							break;
					}
				} catch (error) {
					await vscode.window.showErrorMessage(toErrorMessage(error));
				}
			},
		);
		{
			if (document.getText().trim().length === 0) {
				let initialized = false;
				try {
					initialized = await replaceWholeDocument(
						document,
						serializeAlgorithm([...EMPTY_ALGORITHM]),
					);
				} catch {
					initialized = false;
				}
				if (!initialized) {
					showInvalidDocument(
						"The empty file could not be initialized. It may be read-only.",
					);
					panel.onDidDispose(() => messageDisposable.dispose());
					return;
				}
			}
			const initial = parseAlgorithmDocument(document.getText());
			if (initial.ok) await showVisualEditor();
			else showInvalidDocument(initial.error);
		}

		const documentDisposable = vscode.workspace.onDidChangeTextDocument(
			async (event) => {
				if (event.document.uri.toString() !== document.uri.toString()) return;
				const text = document.getText();
				if (pendingEdit?.text === text) {
					const accepted = pendingEdit;
					pendingEdit = undefined;
					await panel.webview.postMessage({
						type: "editAccepted",
						editId: accepted.editId,
						version: document.version,
					} satisfies ExtensionToWebviewMessage);
					return;
				}
				pendingEdit = undefined;
				const parsed = parseAlgorithmDocument(text);
				if (!parsed.ok) {
					showInvalidDocument(parsed.error);
					return;
				}
				if (!editorLoaded) {
					await showVisualEditor();
					return;
				}
				await sendState("replaceDocument");
			},
		);

		panel.onDidDispose(() => {
			messageDisposable.dispose();
			documentDisposable.dispose();
		});
	}

	private async executeEditorCommand(
		command: Extract<WebviewToExtensionMessage, { type: "command" }>["command"],
		document: vscode.TextDocument,
		webview: vscode.Webview,
	): Promise<void> {
		switch (command) {
			case "new":
				await createNewAlgorithm();
				return;
			case "save":
				await document.save();
				return;
			case "saveAs":
				await vscode.commands.executeCommand("workbench.action.files.saveAs");
				return;
			case "undo":
			case "redo":
				await vscode.commands.executeCommand(command);
				return;
			case "open":
			case "import": {
				const files = await vscode.window.showOpenDialog({
					canSelectMany: false,
					defaultUri: document.uri,
					filters:
						command === "import"
							? { "Legacy AlgoForge files": ["json", "tbr", "xml"] }
							: {
									"AlgoForge files": ["algoforge", "af"],
									"Legacy AlgoForge files": ["json", "tbr", "xml"],
							  },
					openLabel: command === "import" ? "Import" : "Open",
				});
				const uri = files?.[0];
				if (!uri) return;
				if (/\.(?:algoforge|af)$/i.test(uri.path)) {
					await vscode.commands.executeCommand(
						"vscode.openWith",
						uri,
						AlgoForgeEditorProvider.viewType,
					);
					return;
				}
				const content = await vscode.workspace.fs.readFile(uri);
				if (content.byteLength > MAX_IMPORT_SIZE) {
					throw new Error("The selected file exceeds the 5 MB import limit.");
				}
				await webview.postMessage({
					type: "importSource",
					name: posix.basename(uri.path),
					content: Buffer.from(content).toString("utf8"),
				} satisfies ExtensionToWebviewMessage);
			}
		}
	}

	private async exportFile(
		documentUri: vscode.Uri,
		message: Extract<WebviewToExtensionMessage, { type: "exportFile" }>,
	): Promise<void> {
		const uri = await vscode.window.showSaveDialog({
			defaultUri: siblingUri(documentUri, sanitizeFilename(message.suggestedName)),
			saveLabel: "Export",
		});
		if (!uri) return;
		await vscode.workspace.fs.writeFile(
			uri,
			decodeExportContent(message.content, message.encoding),
		);
	}

	private async createImportedDocument(
		documentUri: vscode.Uri,
		name: string,
		algorithm: unknown[],
	): Promise<void> {
		const text = serializeAlgorithm(algorithm);
		const parsed = parseAlgorithmDocument(text);
		if (!parsed.ok) throw new Error(parsed.error);
		const uri = await vscode.window.showSaveDialog({
			defaultUri: siblingUri(
				documentUri,
				`${sanitizeFilename(name || "algorithm")}.algoforge`,
			),
			filters: { "AlgoForge files": ["algoforge", "af"] },
			saveLabel: "Create AlgoForge Document",
		});
		if (!uri) return;
		const target = ensureAlgoForgeExtension(uri);
		await vscode.workspace.fs.writeFile(target, Buffer.from(text, "utf8"));
		await vscode.commands.executeCommand(
			"vscode.openWith",
			target,
			AlgoForgeEditorProvider.viewType,
		);
	}

	private async readCatalog(): Promise<unknown[]> {
		const uri = vscode.Uri.joinPath(
			this.context.extensionUri,
			"dist",
			"webview",
			"library-catalog.json",
		);
		const content = await vscode.workspace.fs.readFile(uri);
		const parsed: unknown = JSON.parse(Buffer.from(content).toString("utf8"));
		return Array.isArray(parsed) ? parsed : [];
	}

	private async getEditorHtml(
		webview: vscode.Webview,
		webviewRoot: vscode.Uri,
	): Promise<string> {
		const htmlUri = vscode.Uri.joinPath(webviewRoot, "index.html");
		let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString(
			"utf8",
		);
		const baseUri = webview.asWebviewUri(webviewRoot).toString().replace(/\/$/, "");
		const nonce = randomNonce();
		const csp = [
			"default-src 'none'",
			`img-src ${webview.cspSource} data: blob:`,
			`media-src ${webview.cspSource} data: blob:`,
			`font-src ${webview.cspSource} data:`,
			`script-src ${webview.cspSource} 'nonce-${nonce}'`,
			`style-src ${webview.cspSource} 'unsafe-inline'`,
		].join("; ");
		html = html.replace(
			"<head>",
			`<head><base href="${escapeHtml(baseUri)}/"><meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}">`,
		);
		html = html.replace(
			/(<script type="application\/json" id="algoforge-runtime-config")[^>]*>[\s\S]*?(<\/script>)/,
			`$1 nonce="${nonce}">${JSON.stringify({
				initialAlgorithm: null,
				title: null,
				hostKind: "vscode",
				isExam: false,
				prettifyInitialAlgorithm: false,
			})}$2`,
		);
		return html;
	}

	private getInvalidDocumentHtml(webview: vscode.Webview, error: string): string {
		const nonce = randomNonce();
		return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invalid AlgoForge document</title>
</head>
<body style="padding:2rem;color:var(--vscode-editor-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)">
<h1>Unable to open this AlgoForge document</h1>
<p>${escapeHtml(error)}</p>
<p>The file has not been changed.</p>
<button id="reopen">Reopen as Text</button>
<script nonce="${nonce}">document.getElementById("reopen").addEventListener("click",()=>acquireVsCodeApi().postMessage({type:"reopenAsText"}));</script>
</body>
</html>`;
	}
}

async function replaceWholeDocument(
	document: vscode.TextDocument,
	text: string,
): Promise<boolean> {
	const edit = new vscode.WorkspaceEdit();
	edit.replace(
		document.uri,
		new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length),
		),
		text,
	);
	return vscode.workspace.applyEdit(edit);
}

export async function createNewAlgorithm(): Promise<void> {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	const defaultUri = workspaceFolder
		? vscode.Uri.joinPath(workspaceFolder.uri, "algorithm.algoforge")
		: undefined;
	const uri = await vscode.window.showSaveDialog({
		defaultUri,
		filters: { "AlgoForge files": ["algoforge", "af"] },
		saveLabel: "Create AlgoForge Algorithm",
	});
	if (!uri) return;
	const target = ensureAlgoForgeExtension(uri);
	await vscode.workspace.fs.writeFile(
		target,
		Buffer.from(serializeAlgorithm([...EMPTY_ALGORITHM]), "utf8"),
	);
	await vscode.commands.executeCommand(
		"vscode.openWith",
		target,
		AlgoForgeEditorProvider.viewType,
	);
}

export async function reopenAsText(uri?: vscode.Uri): Promise<void> {
	let resource = uri;
	if (!resource) {
		const input = vscode.window.tabGroups.activeTabGroup.activeTab?.input;
		if (input instanceof vscode.TabInputCustom) resource = input.uri;
	}
	if (!resource) {
		await vscode.window.showInformationMessage(
			"Open an AlgoForge document before running this command.",
		);
		return;
	}
	await vscode.commands.executeCommand("vscode.openWith", resource, "default");
}

function sanitizeFilename(value: string): string {
	const sanitized = value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim();
	return sanitized || "algorithm";
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function randomNonce(): string {
	const alphabet =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let value = "";
	for (let index = 0; index < 32; index++) {
		value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}
	return value;
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
