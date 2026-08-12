import { describe, expect, test } from "bun:test";
import {
	decodeExportContent,
	ensureAlgoForgeExtension,
	parseAlgorithmDocument,
	serializeAlgorithm,
	titleFromUri,
} from "../src/document";

describe("AlgoForge text document contract", () => {
	test("parses arrays and rejects empty, invalid, and object roots", () => {
		expect(parseAlgorithmDocument("[]")).toEqual({
			ok: true,
			algorithm: [],
		});
		expect(parseAlgorithmDocument("")).toEqual({
			ok: false,
			error: "The file is empty.",
		});
		expect(parseAlgorithmDocument("{}").ok).toBe(false);
		expect(parseAlgorithmDocument("{").ok).toBe(false);
	});

	test("serializes canonical two-space JSON with a final newline", () => {
		expect(serializeAlgorithm([{ typeElement: "DictionnaireDonnee" }])).toBe(
			'[\n  {\n    "typeElement": "DictionnaireDonnee"\n  }\n]\n',
		);
	});

	test("derives titles and applies the canonical extension", () => {
		const uri = {
			path: "/course/search.af",
			with(change: { path: string }) {
				return { ...this, ...change };
			},
		};
		expect(titleFromUri(uri as never)).toBe("search");
		expect(ensureAlgoForgeExtension(uri as never).path).toBe("/course/search.af");

		const withoutExtension = { ...uri, path: "/course/search" };
		expect(ensureAlgoForgeExtension(withoutExtension as never).path).toBe(
			"/course/search.algoforge",
		);
	});

	test("decodes UTF-8 and base64 data URL exports", () => {
		expect(
			Buffer.from(decodeExportContent("hello", "utf8")).toString("utf8"),
		).toBe("hello");
		expect(
			Buffer.from(
				decodeExportContent("data:image/png;base64,aGVsbG8=", "data-url"),
			).toString("utf8"),
		).toBe("hello");
		expect(() => decodeExportContent("not-a-data-url", "data-url")).toThrow();
	});
});
