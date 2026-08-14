import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildEditor } from "../build";

const outputs: string[] = [];

afterAll(async () => {
	await Promise.all(outputs.map((path) => rm(path, { recursive: true, force: true })));
});

describe("exam build exclusion", () => {
	test("removes analyzer code, UI, CSS, catalog, and French messages from the artifact", async () => {
		const directory = await mkdtemp(join(tmpdir(), "algoforge-exam-anomalies-"));
		outputs.push(directory);
		await buildEditor({ outputDirectory: join(directory, "out"), anomalyDetection: false });
		const html = await readFile(join(directory, "out", "index.html"), "utf8");
		for (const marker of [
			"Anomalies de conception",
			"Donnée magique",
			"magic-input",
			"anomaly_btn",
			"switchAnomalyContainer",
			"Détection des anomalies",
			"anomaly-target-error",
			"PartieErreur",
		]) {
			expect(html).not.toContain(marker);
		}
	});
});
