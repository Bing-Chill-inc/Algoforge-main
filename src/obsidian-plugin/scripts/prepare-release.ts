import { copyFile, cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const MIRROR_FILES = [
	".github/workflows/release.yml",
	"LICENSE",
	"README.md",
	"main.js",
	"manifest.json",
	"styles.css",
	"versions.json",
] as const;

const SOURCE_DIRECTORIES = [
	"src/common",
	"src/front-editeur/src",
	"src/obsidian-plugin/src",
	"src/obsidian-plugin/scripts",
	"src/obsidian-plugin/tests",
] as const;
const SOURCE_FILES = [
	"src/back/assetsDynamiques.ts",
	"src/back/types/RouteHandler.d.ts",
	"src/front-editeur/build.ts",
	"src/front-editeur/bun.lock",
	"src/front-editeur/libraryCatalog.ts",
	"src/front-editeur/package.json",
	"src/front-editeur/tsconfig.json",
	"src/front-editeur/tsconfig.build.json",
	"src/front-editeur/tsconfig.anomalies.json",
	"src/obsidian-plugin/build.ts",
	"src/obsidian-plugin/bun.lock",
	"src/obsidian-plugin/package.json",
	"src/obsidian-plugin/tsconfig.json",
] as const;

function mirrorSourcePath(path: string): string {
	// The embedded web editor is reviewable source, but is not Obsidian API code.
	// Obsidian's scanner excludes docs/ while still scanning the plugin under src/.
	return path.startsWith("src/front-editeur/") || path.startsWith("src/back/")
		? `docs/embedded-editor/${path}`
		: path;
}

interface PackageMetadata { version?: unknown; }
interface ManifestMetadata { version?: unknown; minAppVersion?: unknown; }
type VersionsMetadata = Record<string, unknown>;

export function validateReleaseMetadata(
	version: string,
	packageMetadata: PackageMetadata,
	manifest: ManifestMetadata,
	versions: VersionsMetadata,
): void {
	if (!/^\d+\.\d+\.\d+$/.test(version)) {
		throw new Error(`Release version must be numeric SemVer (x.y.z), received: ${version}`);
	}
	if (packageMetadata.version !== version) {
		throw new Error(`package.json version ${String(packageMetadata.version)} does not match ${version}.`);
	}
	if (manifest.version !== version) {
		throw new Error(`manifest.json version ${String(manifest.version)} does not match ${version}.`);
	}
	if (typeof manifest.minAppVersion !== "string" || versions[version] !== manifest.minAppVersion) {
		throw new Error(`versions.json must map ${version} to manifest minAppVersion ${String(manifest.minAppVersion)}.`);
	}
}

export async function stageRelease(root: string, output: string, version: string): Promise<void> {
	const packageMetadata = await readJson<PackageMetadata>(join(root, "package.json"));
	const manifest = await readJson<ManifestMetadata>(join(root, "manifest.json"));
	const versions = await readJson<VersionsMetadata>(join(root, "versions.json"));
	validateReleaseMetadata(version, packageMetadata, manifest, versions);

	const dist = join(root, "dist");
	const distFiles = (await readdir(dist)).sort();
	const expectedDist = ["main.js", "manifest.json", "styles.css"];
	if (JSON.stringify(distFiles) !== JSON.stringify(expectedDist)) {
		throw new Error(`Release build must contain exactly ${expectedDist.join(", ")}; found ${distFiles.join(", ")}.`);
	}

	await rm(output, { recursive: true, force: true });
	await mkdir(join(output, ".github", "workflows"), { recursive: true });
	await Promise.all([
		copyFile(join(root, "README.md"), join(output, "README.md")),
		copyFile(join(root, "LICENSE"), join(output, "LICENSE")),
		copyFile(join(root, "manifest.json"), join(output, "manifest.json")),
		copyFile(join(root, "versions.json"), join(output, "versions.json")),
		copyFile(join(dist, "main.js"), join(output, "main.js")),
		copyFile(join(dist, "styles.css"), join(output, "styles.css")),
		copyFile(
			join(root, "release-repo", ".github", "workflows", "release.yml"),
			join(output, ".github", "workflows", "release.yml"),
		),
	]);

	const monorepoRoot = dirname(dirname(root));
	for (const directory of SOURCE_DIRECTORIES) {
		const destination = join(output, mirrorSourcePath(directory));
		await mkdir(dirname(destination), { recursive: true });
		await cp(join(monorepoRoot, directory), destination, {
			recursive: true,
			filter: (path) => basename(path) !== ".DS_Store",
		});
	}
	for (const file of SOURCE_FILES) {
		const destination = join(output, mirrorSourcePath(file));
		await mkdir(dirname(destination), { recursive: true });
		await copyFile(join(monorepoRoot, file), destination);
	}

	const staged = await listFiles(output);
	const expected = [
		...MIRROR_FILES,
		...SOURCE_FILES.map(mirrorSourcePath),
		...(await Promise.all(SOURCE_DIRECTORIES.map(async (directory) =>
			(await listFiles(join(monorepoRoot, directory))).map((file) =>
				mirrorSourcePath(`${directory}/${file}`)),
		))).flat(),
	].sort();
	if (JSON.stringify(staged) !== JSON.stringify(expected)) {
		throw new Error(`Unexpected mirror contents: ${staged.join(", ")}.`);
	}
}

async function readJson<T>(path: string): Promise<T> {
	return JSON.parse(await readFile(path, "utf8")) as T;
}

async function listFiles(root: string, current = root): Promise<string[]> {
	const result: string[] = [];
	for (const name of await readdir(current)) {
		if (name === ".DS_Store") continue;
		const path = join(current, name);
		if ((await stat(path)).isDirectory()) result.push(...await listFiles(root, path));
		else result.push(relative(root, path).replaceAll("\\", "/"));
	}
	return result.sort();
}

function argument(name: string): string | undefined {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : undefined;
}

if (import.meta.main) {
	const version = argument("--version");
	const output = argument("--output");
	if (!version || !output) {
		console.error("Usage: bun run scripts/prepare-release.ts --version X.Y.Z --output PATH");
		process.exit(2);
	}
	const root = dirname(dirname(fileURLToPath(import.meta.url)));
	await stageRelease(root, output, version);
	console.log(`Staged AlgoForge Obsidian ${version} in ${output}.`);
}
