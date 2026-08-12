import { basename, join } from "node:path";

const projectRoot = import.meta.dir;
const vsix = process.argv[2] ?? join(
	projectRoot,
	"out",
	"algoforge-vscode-0.1.1.vsix",
);

const listProcess = Bun.spawn(["unzip", "-Z1", vsix], {
	stdout: "pipe",
	stderr: "pipe",
});
const fileList = await new Response(listProcess.stdout).text();
const listError = await new Response(listProcess.stderr).text();
if ((await listProcess.exited) !== 0) {
	throw new Error(`Unable to inspect ${basename(vsix)}: ${listError.trim()}`);
}

const files = fileList.trim().split("\n");
for (const required of [
	"extension/dist/extension.js",
	"extension/dist/media/algoforge-file-light.svg",
	"extension/dist/media/algoforge-file-dark.svg",
	"extension/dist/webview/library-catalog.json",
]) {
	if (!files.includes(required)) throw new Error(`VSIX is missing ${required}.`);
}
for (const forbidden of ["node_modules/", "front-editeur/src/", "dist/test/"]) {
	if (files.some((file) => file.includes(forbidden))) {
		throw new Error(`VSIX unexpectedly contains ${forbidden}.`);
	}
}

const bundleProcess = Bun.spawn(
	["unzip", "-p", vsix, "extension/dist/extension.js"],
	{ stdout: "pipe", stderr: "pipe" },
);
const bundle = await new Response(bundleProcess.stdout).text();
if ((await bundleProcess.exited) !== 0) {
	throw new Error("Unable to read the packaged extension host bundle.");
}
for (const [label, pattern] of [
	["legacy url.parse", /\burl\.parse\s*\(/],
	["editor source paths", /front-editeur\/src/],
	["analytics", /plausible\.feror\.fr/],
] as const) {
	if (pattern.test(bundle)) throw new Error(`VSIX bundle contains ${label}.`);
}

console.log(`Verified ${basename(vsix)} (${files.length} files).`);
