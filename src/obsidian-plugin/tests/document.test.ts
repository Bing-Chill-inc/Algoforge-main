import { describe, expect, test } from "bun:test";
import {
	findAlgorithmEmbeds,
	normalizeAlgorithmPath,
	parseAlgorithmDocument,
	serializeAlgorithm,
	targetFromEmbedSource,
	targetFromRenderedEmbed,
} from "../src/document";

describe("AlgoForge Obsidian documents", () => {
	test("round-trips versioned documents and accepts legacy arrays", () => {
		const algorithm = [{ typeElement: "DictionnaireDonnee", types: {}, signification: {} }];
		expect(parseAlgorithmDocument(JSON.stringify(algorithm))).toMatchObject({ ok: true, formatVersion: 0 });
		expect(parseAlgorithmDocument(serializeAlgorithm(algorithm))).toMatchObject({ ok: true, formatVersion: 1, algorithm });
	});

	test("rejects malformed and oversized documents", () => {
		expect(parseAlgorithmDocument("nope").ok).toBe(false);
		expect(parseAlgorithmDocument("x".repeat(5_000_001)).ok).toBe(false);
	});

	test("normalizes safe vault paths", () => {
		expect(normalizeAlgorithmPath(" algorithms/test ")).toBe("algorithms/test.af");
		expect(normalizeAlgorithmPath("legacy.algoforge")).toBe("legacy.algoforge");
		expect(() => normalizeAlgorithmPath("../outside.af")).toThrow();
		expect(() => normalizeAlgorithmPath("bad:name.af")).toThrow();
	});

	test("finds only AlgoForge wiki embeds", () => {
		const source = "before ![[folder/a.af|A]] and ![[legacy.algoforge#part]] after";
		expect(findAlgorithmEmbeds(source).map((match) => match.target)).toEqual(["folder/a.af", "legacy.algoforge"]);
		expect(targetFromEmbedSource("folder/a.af#section")).toBe("folder/a.af");
		expect(targetFromEmbedSource("image.png")).toBeUndefined();
		expect(targetFromEmbedSource("![[folder/encoded%20name.af|Preview]]")).toBe("folder/encoded name.af");
		expect(targetFromRenderedEmbed([null, "folder/a.af"], "ignored")).toBe("folder/a.af");
		expect(targetFromRenderedEmbed([], "algorithm.af")).toBe("algorithm.af");
		expect(targetFromRenderedEmbed([], "Generic file")).toBeUndefined();
	});
});
