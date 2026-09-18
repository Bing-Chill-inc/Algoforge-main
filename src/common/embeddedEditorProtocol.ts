export interface EmbeddedLibraryEntry {
	nom?: string;
	nomCourt?: string;
	descriptif?: string;
	algo?: string;
	path?: string;
}

export interface EmbeddedLibraryCategory {
	nom: string;
	nomCourt?: string;
	contenu: EmbeddedLibraryEntry[];
}

export type EmbeddedHostCommand =
	| "new"
	| "open"
	| "save"
	| "saveAs"
	| "undo"
	| "redo"
	| "import";

export interface EmbeddedHostCapabilities {
	undoRedo: "host" | "editor";
}

export interface EmbeddedPreviewTheme {
	background: string;
	foreground: string;
	border: string;
}

export type EditorToHostMessage =
	| { type: "ready" }
	| {
			type: "documentChanged";
			editId: number;
			algorithm: unknown[];
			baseVersion: number;
	  }
	| { type: "command"; command: EmbeddedHostCommand }
	| { type: "clipboardRead"; requestId: number }
	| { type: "clipboardWrite"; text: string }
	| {
			type: "exportFile";
			suggestedName: string;
			mimeType: string;
			content: string;
			encoding: "utf8" | "data-url";
	  }
	| { type: "createImportedDocument"; name: string; algorithm: unknown[] }
	| { type: "customLibrary"; value: unknown[] }
	| {
			type: "preference";
			name: "theme" | "glow";
			value: string | boolean;
	  }
	| { type: "openExternal"; href: string }
	| { type: "error"; message: string }
	| { type: "reopenAsText" }
	| { type: "previewRendered"; requestId: number; svg?: string; error?: string };

export type HostToEditorMessage =
	| {
			type: "initialize" | "replaceDocument";
			algorithm: unknown[];
			title: string;
			version: number;
			library?: EmbeddedLibraryCategory[];
			customLibrary?: unknown[];
			preferences?: { theme?: string; glow?: boolean };
			capabilities?: EmbeddedHostCapabilities;
	  }
	| {
			type: "editRejected";
			algorithm: unknown[];
			title: string;
			version: number;
			error?: string;
	  }
	| { type: "editAccepted"; editId: number; version: number }
	| { type: "clipboardResult"; requestId: number; text: string }
	| { type: "importSource"; name: string; content: string }
	| {
			type: "renderPreview";
			requestId: number;
			algorithm: unknown[];
			title: string;
			theme?: EmbeddedPreviewTheme;
	  };
