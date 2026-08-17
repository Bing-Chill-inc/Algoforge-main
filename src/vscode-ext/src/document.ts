import { posix } from "node:path";
import type { Uri } from "vscode";
import {
	decodeAlgoForgeDocument,
	serializeAlgoForgeDocument,
} from "../../common/algorithmFormat";

export const EMPTY_ALGORITHM = [
	{
		typeElement: "DictionnaireDonnee",
		types: {},
		signification: {},
	},
] as const;

export type ParsedAlgorithm =
	| { ok: true; algorithm: unknown[]; formatVersion: 0 | 1 }
	| { ok: false; error: string };

export function parseAlgorithmDocument(text: string): ParsedAlgorithm {
	if (text.trim().length === 0) {
		return { ok: false, error: "The file is empty." };
	}
	try {
		const value: unknown = JSON.parse(text);
		const decoded = decodeAlgoForgeDocument(value);
		return {
			ok: true,
			algorithm: decoded.algorithm,
			formatVersion: decoded.version,
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Invalid JSON.",
		};
	}
}

export function serializeAlgorithm(algorithm: unknown[]): string {
	return serializeAlgoForgeDocument(algorithm);
}

export function titleFromUri(uri: Uri): string {
	const filename = posix.basename(uri.path);
	const extension = posix.extname(filename);
	return extension.length > 0 ? filename.slice(0, -extension.length) : filename;
}

export function siblingUri(uri: Uri, filename: string): Uri {
	return uri.with({ path: posix.join(posix.dirname(uri.path), filename) });
}

export function ensureAlgoForgeExtension(uri: Uri): Uri {
	if (/\.(?:algoforge|af)$/i.test(uri.path)) return uri;
	return uri.with({ path: `${uri.path}.af` });
}

export function decodeExportContent(
	content: string,
	encoding: "utf8" | "data-url",
): Uint8Array {
	if (encoding === "utf8") return Buffer.from(content, "utf8");
	const match = /^data:[^;,]+(?:;charset=[^;,]+)?;base64,(.*)$/s.exec(content);
	if (!match) throw new Error("The editor returned an invalid data URL.");
	return Buffer.from(match[1], "base64");
}
