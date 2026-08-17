import { describe, expect, test } from "bun:test";
import path from "node:path";
import {
	findAlgoForgeFileArguments,
	parseAlgoForgeFile,
} from "../algorithm-file.js";

describe("AlgoForge desktop files", () => {
	test("accepts legacy v0 arrays", () => {
		const document = [{ typeElement: "Probleme" }];
		expect(parseAlgoForgeFile(JSON.stringify(document))).toEqual(document);
	});

	test("accepts v1 envelopes", () => {
		const document = { version: 1, algorithm: [] };
		expect(parseAlgoForgeFile(JSON.stringify(document))).toEqual(document);
	});

	test("rejects explicit v0 envelopes", () => {
		expect(() =>
			parseAlgoForgeFile('{"version":0,"algorithm":[]}'),
		).toThrow("legacy root JSON array");
	});

	test("rejects future versions without opening them", () => {
		expect(() =>
			parseAlgoForgeFile('{"version":2,"algorithm":[]}'),
		).toThrow("a newer AlgoForge version is required");
	});

	test("discovers only .af launch arguments and removes duplicates", () => {
		const workingDirectory = path.join(path.sep, "tmp", "algoforge");
		expect(
			findAlgoForgeFileArguments(
				["--flag", "example.json", "demo.af", "demo.af", "UPPER.AF"],
				workingDirectory,
			),
		).toEqual([
			path.join(workingDirectory, "demo.af"),
			path.join(workingDirectory, "UPPER.AF"),
		]);
	});
});
