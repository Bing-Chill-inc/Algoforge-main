export const CURRENT_ALGOFORGE_VERSION = 1 as const;

export interface AlgoForgeDocumentV1 {
	version: typeof CURRENT_ALGOFORGE_VERSION;
	algorithm: unknown[];
}

export interface DecodedAlgoForgeDocument {
	version: 0 | typeof CURRENT_ALGOFORGE_VERSION;
	algorithm: unknown[];
}

export class AlgoForgeFormatError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AlgoForgeFormatError";
	}
}

export function decodeAlgoForgeDocument(
	value: unknown,
): DecodedAlgoForgeDocument {
	if (Array.isArray(value)) {
		return { version: 0, algorithm: value };
	}

	if (typeof value !== "object" || value === null) {
		throw new AlgoForgeFormatError(
			"AlgoForge documents must contain a legacy JSON array or a versioned document object.",
		);
	}

	const document = value as Record<string, unknown>;
	const version = document.version;
	if (
		typeof version !== "number" ||
		!Number.isInteger(version) ||
		version < 0
	) {
		throw new AlgoForgeFormatError(
			"Versioned AlgoForge documents must declare a non-negative integer version.",
		);
	}
	if (version > CURRENT_ALGOFORGE_VERSION) {
		throw new AlgoForgeFormatError(
			`This document uses AlgoForge format version ${version}. AlgoForge format version ${CURRENT_ALGOFORGE_VERSION} is the newest version supported here; a newer AlgoForge version is required.`,
		);
	}
	if (version !== CURRENT_ALGOFORGE_VERSION) {
		throw new AlgoForgeFormatError(
			"AlgoForge format version 0 is represented by a legacy root JSON array, not a versioned object.",
		);
	}
	if (!Array.isArray(document.algorithm)) {
		throw new AlgoForgeFormatError(
			'AlgoForge format version 1 requires an "algorithm" array.',
		);
	}

	return { version, algorithm: document.algorithm };
}

export function createAlgoForgeDocument(
	algorithm: unknown[],
): AlgoForgeDocumentV1 {
	return { version: CURRENT_ALGOFORGE_VERSION, algorithm };
}

export function serializeAlgoForgeDocument(algorithm: unknown[]): string {
	return `${JSON.stringify(createAlgoForgeDocument(algorithm), null, 2)}\n`;
}
