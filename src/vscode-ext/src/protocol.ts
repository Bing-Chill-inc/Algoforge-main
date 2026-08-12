export interface LibraryCategory {
	nom: string;
	nomCourt?: string;
	contenu: Array<{
		nom?: string;
		nomCourt?: string;
		descriptif?: string;
		algo?: string;
		path?: string;
	}>;
}

export type WebviewToExtensionMessage =
	| { type: "ready" }
	| {
			type: "documentChanged";
			editId: number;
			algorithm: unknown[];
			baseVersion: number;
	  }
	| { type: "command"; command: "new" | "open" | "save" | "saveAs" | "undo" | "redo" | "import" }
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
	| { type: "reopenAsText" };

export type ExtensionToWebviewMessage =
	| {
			type: "initialize" | "replaceDocument";
			algorithm: unknown[];
			title: string;
			version: number;
			library?: LibraryCategory[];
			customLibrary?: unknown[];
			preferences?: { theme?: string; glow?: boolean };
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
	| { type: "importSource"; name: string; content: string };
