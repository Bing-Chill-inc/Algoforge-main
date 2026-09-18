import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { buildEditor } from "../front-editeur/build";
import { buildLibraryCatalog } from "../front-editeur/libraryCatalog";

const root = import.meta.dir;
const dist = join(root, "dist");
const editorOutput = join(dist, ".editor");
const development = process.argv.includes("--development");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await buildEditor({ development, target: "embedded", outputDirectory: editorOutput });
const editorHtml = await Bun.file(join(editorOutput, "index.html")).text();
const libraryCatalog = await buildLibraryCatalog();

const result = await Bun.build({
	entrypoints: [join(root, "src", "main.ts")],
	outdir: dist,
	target: "browser",
	format: "cjs",
	minify: !development,
	sourcemap: development ? "external" : "none",
	external: [
		"obsidian", "electron", "@codemirror/state", "@codemirror/view",
		"@codemirror/language", "@lezer/common",
	],
	plugins: [{
		name: "algoforge-embedded-assets",
		setup(build) {
			build.onResolve({ filter: /^virtual:algoforge-assets$/ }, () => ({ path: "algoforge-assets", namespace: "algoforge" }));
			build.onLoad({ filter: /.*/, namespace: "algoforge" }, () => ({
				contents: `export const editorHtml=${JSON.stringify(editorHtml)};export const libraryCatalog=${JSON.stringify(libraryCatalog)};`,
				loader: "js",
			}));
		},
	}],
});
if (!result.success) {
	for (const log of result.logs) console.error(log);
	throw new Error("The Obsidian plugin bundle could not be built.");
}
await Bun.write(join(dist, "manifest.json"), Bun.file(join(root, "manifest.json")));
await Bun.write(join(dist, "styles.css"), Bun.file(join(root, "styles.css")));
await rm(editorOutput, { recursive: true, force: true });

const files = Array.from(new Bun.Glob("*").scanSync({ cwd: dist })).sort();
const expected = development ? ["main.js", "main.js.map", "manifest.json", "styles.css"] : ["main.js", "manifest.json", "styles.css"];
if (JSON.stringify(files) !== JSON.stringify(expected)) throw new Error(`Unexpected release files: ${files.join(", ")}`);
const bundle = await Bun.file(join(dist, "main.js")).text();
for (const [label, pattern] of [
	["analytics", /plausible\.feror\.fr/],
	["cloud API", /\/api\/(?:users|algos)/],
	["source path", /front-editeur\/src/],
	["dynamic evaluation", /\beval\s*\(/],
] as const) if (pattern.test(bundle)) throw new Error(`The Obsidian bundle contains ${label}.`);
if (!bundle.includes("algoforge-runtime-config") || !bundle.includes("Bibliotheque")) throw new Error("Embedded assets are missing from main.js.");
console.log(`Built AlgoForge for Obsidian (${bundle.length} bytes, ${libraryCatalog.length} library categories).`);
