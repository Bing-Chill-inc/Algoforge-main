import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const webviewRoot = join(import.meta.dir, "..", "dist", "webview");
const extensionRoot = join(import.meta.dir, "..", "dist");

describe("VS Code webview build", () => {
	test("emits external assets without analytics or copied editor sources", async () => {
		const html = await Bun.file(join(webviewRoot, "index.html")).text();
		expect(html).toContain('<script type="module"');
		expect(html).toContain('<link rel="stylesheet"');
		expect(html).toContain('"hostKind":"web"');
		expect(html).not.toContain("plausible.feror.fr");
		expect(html).not.toContain("front-editeur/src");
	});

	test("packages the generated built-in library catalog", async () => {
		const catalog = await Bun.file(
			join(webviewRoot, "library-catalog.json"),
		).json();
		expect(Array.isArray(catalog)).toBe(true);
		expect(catalog.length).toBeGreaterThan(0);
		expect(catalog[0]).toHaveProperty("contenu");
	});

	test("packages file icons and excludes legacy URL parsing", async () => {
		for (const icon of ["algoforge-file-light.svg", "algoforge-file-dark.svg"]) {
			const logo = await Bun.file(join(extensionRoot, "media", icon)).text();
			expect(logo).toContain('<g id="Marteau">');
			expect(logo).toContain('<g id="AlgoForge">');
			expect(logo).toContain('<g id="Anvil">');
		}
		const bundle = await Bun.file(join(extensionRoot, "extension.js")).text();
		expect(bundle).not.toMatch(/\burl\.parse\s*\(/);
		expect(bundle).not.toContain("front-editeur/src");
	});
});
