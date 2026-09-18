import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const dist = join(import.meta.dir, "..", "dist");

describe("Obsidian release", () => {
	test("contains only Community plugin release files", async () => {
		const files = Array.from(new Bun.Glob("*").scanSync({ cwd: dist })).sort();
		expect(files).toEqual(["main.js", "manifest.json", "styles.css"]);
		const manifest = await Bun.file(join(dist, "manifest.json")).json();
		expect(manifest).toMatchObject({ id: "algoforge", minAppVersion: "1.6.0", isDesktopOnly: true });
	});

	test("embeds the offline editor and catalog", async () => {
		const bundle = await Bun.file(join(dist, "main.js")).text();
		expect(bundle).toContain("algoforge-runtime-config");
		expect(bundle).toContain("Bibliotheque");
		expect(bundle).not.toContain("plausible.feror.fr");
		expect(bundle).not.toMatch(/\/api\/(?:users|algos)/);
		expect(bundle).not.toMatch(/\beval\s*\(/);
	});
});
