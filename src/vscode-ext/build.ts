import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { buildEditor } from "../front-editeur/build";
import { buildLibraryCatalog } from "../front-editeur/libraryCatalog";
import AssetsDynamiques from "../back/assetsDynamiques";

const projectRoot = import.meta.dir;
const distDirectory = join(projectRoot, "dist");
const webviewDirectory = join(distDirectory, "webview");
const development = process.argv.includes("--development");

await rm(distDirectory, { recursive: true, force: true });
await mkdir(distDirectory, { recursive: true });
await mkdir(join(projectRoot, "out"), { recursive: true });

await buildEditor({
	development,
	target: "webview",
	outputDirectory: webviewDirectory,
});

const catalog = await buildLibraryCatalog();
await Bun.write(
	join(webviewDirectory, "library-catalog.json"),
	`${JSON.stringify(catalog)}\n`,
);

const extensionBuild = await Bun.build({
	entrypoints: [join(projectRoot, "src", "extension.ts")],
	outdir: distDirectory,
	target: "node",
	format: "cjs",
	external: ["vscode"],
	minify: !development,
	sourcemap: development ? "external" : "none",
});

if (!extensionBuild.success) {
	for (const log of extensionBuild.logs) console.error(log);
	throw new Error("The VS Code extension host bundle could not be built.");
}

const integrationBuild = await Bun.build({
	entrypoints: [join(projectRoot, "tests", "integration", "index.ts")],
	outdir: join(distDirectory, "test"),
	target: "node",
	format: "cjs",
	external: ["vscode"],
	minify: false,
});

if (!integrationBuild.success) {
	for (const log of integrationBuild.logs) console.error(log);
	throw new Error("The VS Code integration test bundle could not be built.");
}


await mkdir(join(distDirectory, "media"), { recursive: true });
await Bun.write(
	join(distDirectory, "media", "icon.png"),
	Bun.file(join(projectRoot, "..", "electron", "icons", "AlgoForge.png")),
);
for (const [icon, color] of [
	["algoforge-file-light.svg", "173b4f"],
	["algoforge-file-dark.svg", "d7e7ef"],
] as const) {
	await Bun.write(
		join(distDirectory, "media", icon),
		renderAlgoForgeLogo(color),
	);
}

const html = await Bun.file(join(webviewDirectory, "index.html")).text();
if (html.includes("plausible.feror.fr")) {
	throw new Error("The VS Code webview build must not include analytics.");
}
if (!extensionBuild.outputs.some((output) => output.path.endsWith("extension.js"))) {
	throw new Error("The extension build did not emit dist/extension.js.");
}
const extensionBundle = await Bun.file(join(distDirectory, "extension.js")).text();
for (const [label, pattern] of [
	["legacy url.parse", /\burl\.parse\s*\(/],
	["editor source paths", /front-editeur\/src/],
	["analytics", /plausible\.feror\.fr/],
] as const) {
	if (pattern.test(extensionBundle)) {
		throw new Error(`The extension host bundle contains ${label}.`);
	}
}

console.log(
	`Built AlgoForge VS Code extension with ${catalog.length} library categories.`,
);

function renderAlgoForgeLogo(fgColor: string): string {
	const route = AssetsDynamiques.find(
		(candidate) => candidate.route === "/AlgoForge.svg",
	);
	if (!route) throw new Error("The canonical AlgoForge logo route is missing.");
	let svg = "";
	route.callback(
		{ query: { fgColor } } as never,
		{
			setHeader: () => undefined,
			send: (value: unknown) => {
				svg = String(value);
			},
		} as never,
	);
	if (!svg.includes('<g id="Marteau">') || !svg.includes('<g id="Anvil">')) {
		throw new Error("The generated file icon is not the AlgoForge logo.");
	}
	return `${svg.trim()}\n`;
}
