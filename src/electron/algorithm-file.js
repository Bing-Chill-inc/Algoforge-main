import path from "node:path";

export const ALGOFORGE_FILE_EXTENSION = ".af";
export const ALGOFORGE_MIME_TYPE = "application/vnd.algoforge+json";
export const CURRENT_ALGOFORGE_VERSION = 1;
export const MAX_ALGOFORGE_FILE_SIZE = 5 * 1024 * 1024;

export class AlgoForgeFileError extends Error {
	constructor(message) {
		super(message);
		this.name = "AlgoForgeFileError";
	}
}

/**
 * Parse and validate a complete AlgoForge document without changing its shape.
 * The renderer performs the actual v0/v1 decoding when it hydrates the editor.
 */
export function parseAlgoForgeFile(content) {
	let document;
	try {
		document = JSON.parse(content);
	} catch {
		throw new AlgoForgeFileError(
			"This .af file does not contain valid JSON.",
		);
	}

	if (Array.isArray(document)) {
		return document;
	}

	if (typeof document !== "object" || document === null) {
		throw new AlgoForgeFileError(
			"AlgoForge documents must contain a legacy JSON array or a versioned document object.",
		);
	}

	const version = document.version;
	if (
		typeof version !== "number" ||
		!Number.isInteger(version) ||
		version < 0
	) {
		throw new AlgoForgeFileError(
			"Versioned AlgoForge documents must declare a non-negative integer version.",
		);
	}
	if (version > CURRENT_ALGOFORGE_VERSION) {
		throw new AlgoForgeFileError(
			`This document uses AlgoForge format version ${version}. AlgoForge format version ${CURRENT_ALGOFORGE_VERSION} is the newest version supported here; a newer AlgoForge version is required.`,
		);
	}
	if (version !== CURRENT_ALGOFORGE_VERSION) {
		throw new AlgoForgeFileError(
			"AlgoForge format version 0 is represented by a legacy root JSON array, not a versioned object.",
		);
	}
	if (!Array.isArray(document.algorithm)) {
		throw new AlgoForgeFileError(
			'AlgoForge format version 1 requires an "algorithm" array.',
		);
	}

	return document;
}

export function findAlgoForgeFileArguments(args, workingDirectory) {
	const baseDirectory = workingDirectory || process.cwd();
	const seen = new Set();
	const files = [];

	for (const argument of args) {
		if (
			typeof argument !== "string" ||
			path.extname(argument).toLowerCase() !== ALGOFORGE_FILE_EXTENSION
		) {
			continue;
		}

		const filePath = path.resolve(baseDirectory, argument);
		if (!seen.has(filePath)) {
			seen.add(filePath);
			files.push(filePath);
		}
	}

	return files;
}
