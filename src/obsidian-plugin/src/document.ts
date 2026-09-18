import {
	decodeAlgoForgeDocument,
	serializeAlgoForgeDocument,
} from "../../common/algorithmFormat";

export const MAX_ALGORITHM_SIZE = 5_000_000;
export const ALGORITHM_EXTENSIONS = new Set(["af", "algoforge"]);
export const IMPORT_EXTENSIONS = new Set(["json", "tbr", "xml"]);
export const EMPTY_ALGORITHM = [
	{ typeElement: "DictionnaireDonnee", types: {}, signification: {} },
] as const;

export type ParsedAlgorithm =
	| { ok: true; algorithm: unknown[]; formatVersion: 0 | 1 }
	| { ok: false; error: string };

export function parseAlgorithmDocument(text: string): ParsedAlgorithm {
	if (new TextEncoder().encode(text).byteLength > MAX_ALGORITHM_SIZE) {
		return { ok: false, error: "The AlgoForge file exceeds the 5 MB limit." };
	}
	if (text.trim().length === 0) return { ok: false, error: "The file is empty." };
	try {
		const decoded = decodeAlgoForgeDocument(JSON.parse(text) as unknown);
		return { ok: true, algorithm: decoded.algorithm, formatVersion: decoded.version };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : "Invalid JSON." };
	}
}

export function serializeAlgorithm(algorithm: unknown[]): string {
	return serializeAlgoForgeDocument(algorithm);
}

export function isAlgorithmExtension(extension: string): boolean {
	return ALGORITHM_EXTENSIONS.has(extension.toLowerCase());
}

export function normalizeAlgorithmPath(input: string): string {
	let value = input.trim().replaceAll("\\", "/").replace(/^\/+/, "");
	if (!value) throw new Error("Enter a vault-relative file path.");
	const parts = value.split("/");
	if (parts.some((part) => !part || part === "." || part === "..")) {
		throw new Error("The path must not contain empty, current, or parent segments.");
	}
	if (/[\u0000-\u001f:*?"<>|]/.test(value)) {
		throw new Error("The path contains characters that are not valid in a file name.");
	}
	if (!/\.(?:af|algoforge)$/i.test(value)) value += ".af";
	return value;
}

export interface EmbedMatch {
	from: number;
	to: number;
	target: string;
}

const EMBED_PATTERN = /!\[\[([^\]|#]+\.(?:af|algoforge))(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/giu;

export function findAlgorithmEmbeds(text: string, offset = 0): EmbedMatch[] {
	const result: EmbedMatch[] = [];
	for (const match of text.matchAll(EMBED_PATTERN)) {
		if (match.index === undefined || !match[1]) continue;
		result.push({ from: offset + match.index, to: offset + match.index + match[0].length, target: match[1] });
	}
	return result;
}

export function targetFromEmbedSource(source: string): string | undefined {
	let decoded = source.trim();
	try { decoded = decodeURIComponent(decoded); } catch { /* retain the original source */ }
	const wikiMatch = /^!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]$/.exec(decoded);
	if (wikiMatch?.[1]) decoded = wikiMatch[1];
	const normalized = decoded.split(/[?#]/, 1)[0]?.trim().replace(/^\.\//, "");
	return normalized && /\.(?:af|algoforge)$/i.test(normalized) ? normalized : undefined;
}

/** Extract an AlgoForge link from version-dependent generic embed DOM. */
export function targetFromRenderedEmbed(
	attributes: Iterable<string | null | undefined>,
	textContent?: string | null,
): string | undefined {
	for (const value of attributes) {
		if (!value) continue;
		const target = targetFromEmbedSource(value);
		if (target) return target;
	}
	for (const line of (textContent ?? "").split(/[\r\n]+/)) {
		const target = targetFromEmbedSource(line);
		if (target) return target;
	}
	return undefined;
}
