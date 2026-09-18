import type {
	EditorToHostMessage,
	EmbeddedHostCapabilities,
	EmbeddedHostCommand,
	EmbeddedLibraryCategory,
	HostToEditorMessage,
} from "../../../common/embeddedEditorProtocol";
import { hostKind } from "./runtime";
import {
	EditorDocumentController,
	type DocumentChangeMessage,
} from "./documentController";

export const EMPTY_ALGORITHM = [
	{
		typeElement: "DictionnaireDonnee",
		types: {},
		signification: {},
	},
] as const;

export type LibraryCategory = EmbeddedLibraryCategory;
export type LibraryEntry = EmbeddedLibraryCategory["contenu"][number];
export type HostCommand = EmbeddedHostCommand;

type EmbeddedHostApi = {
	postMessage(message: EditorToHostMessage): void;
	getState(): unknown;
	setState(state: unknown): void;
};

const globalWithHost = globalThis as typeof globalThis & {
	acquireAlgoForgeHostApi?: () => EmbeddedHostApi;
};

let hostApi: EmbeddedHostApi | undefined;
let requestId = 0;
let library: LibraryCategory[] = [];
let customLibrary: unknown[] = [];
let capabilities: EmbeddedHostCapabilities = { undoRedo: "host" };
const clipboardRequests = new Map<number, (text: string) => void>();
const messageListeners = new Set<(message: HostToEditorMessage) => void>();
let documentController: EditorDocumentController | undefined;
let hostPreferencesReady = false;

export function initializeHost(): void {
	if (hostKind !== "embedded" || hostApi) return;
	hostApi = globalWithHost.acquireAlgoForgeHostApi?.();
	window.addEventListener("message", (event: MessageEvent<HostToEditorMessage>) => {
		const message = event.data;
		if (!message || typeof message !== "object" || !("type" in message)) return;
		if (message.type === "initialize" || message.type === "replaceDocument") {
			if (message.library) library = message.library;
			if (message.customLibrary) customLibrary = message.customLibrary;
			if (message.capabilities) capabilities = message.capabilities;
		}
		if (message.type === "clipboardResult") {
			clipboardRequests.get(message.requestId)?.(message.text);
			clipboardRequests.delete(message.requestId);
		}
		for (const listener of messageListeners) listener(message);
		if (message.type === "initialize") hostPreferencesReady = true;
	});
}

export function onHostMessage(listener: (message: HostToEditorMessage) => void): () => void {
	messageListeners.add(listener);
	return () => messageListeners.delete(listener);
}

export function isEmbeddedHost(): boolean {
	return hostKind === "embedded";
}

export function usesHostUndoRedo(): boolean {
	return isEmbeddedHost() && capabilities.undoRedo === "host";
}

export function postHostMessage(message: EditorToHostMessage): void {
	hostApi?.postMessage(message);
}

export function hostReady(): void {
	postHostMessage({ type: "ready" });
}

export function initializeDocumentController(
	serialize: () => unknown[],
): EditorDocumentController {
	documentController = new EditorDocumentController(
		serialize,
		(message: DocumentChangeMessage) => postHostMessage(message),
	);
	return documentController;
}

export function commitDocumentChange(): void {
	documentController?.commit();
}

export function updateHostPreference(
	name: "theme" | "glow",
	value: string | boolean,
): void {
	if (hostPreferencesReady) postHostMessage({ type: "preference", name, value });
}

export function executeHostCommand(command: HostCommand): void {
	postHostMessage({ type: "command", command });
}

export async function readHostClipboard(): Promise<string> {
	if (!isEmbeddedHost()) return navigator.clipboard.readText();
	const currentRequestId = ++requestId;
	return new Promise((resolve) => {
		clipboardRequests.set(currentRequestId, resolve);
		postHostMessage({ type: "clipboardRead", requestId: currentRequestId });
	});
}

export async function writeHostClipboard(text: string): Promise<void> {
	if (!isEmbeddedHost()) {
		await navigator.clipboard.writeText(text);
		return;
	}
	postHostMessage({ type: "clipboardWrite", text });
}

export function saveHostFile(
	suggestedName: string,
	mimeType: string,
	content: string,
	encoding: "utf8" | "data-url" = "utf8",
): boolean {
	if (!isEmbeddedHost()) return false;
	postHostMessage({ type: "exportFile", suggestedName, mimeType, content, encoding });
	return true;
}

export function createImportedDocument(name: string, algorithm: unknown[]): void {
	postHostMessage({ type: "createImportedDocument", name, algorithm });
}

export function openExternal(href: string): void {
	if (isEmbeddedHost()) postHostMessage({ type: "openExternal", href });
	else window.open(href, "_blank", "noopener,noreferrer");
}

export function getBuiltInLibrary(): LibraryCategory[] {
	return library;
}

export function getCustomLibrary(): unknown[] {
	return customLibrary;
}

export function updateCustomLibrary(value: unknown[]): void {
	customLibrary = value;
	if (isEmbeddedHost()) postHostMessage({ type: "customLibrary", value });
}

export function reportHostError(message: string): void {
	postHostMessage({ type: "error", message });
}
