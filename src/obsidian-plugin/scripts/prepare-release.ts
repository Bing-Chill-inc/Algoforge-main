import { copyFile, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
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

	const staged = await listFiles(output);
	if (JSON.stringify(staged) !== JSON.stringify([...MIRROR_FILES])) {
		throw new Error(`Unexpected mirror contents: ${staged.join(", ")}.`);
	}
}

async function readJson<T>(path: string): Promise<T> {
	return JSON.parse(await readFile(path, "utf8")) as T;
}

async function listFiles(root: string, current = root): Promise<string[]> {
	const result: string[] = [];
	for (const name of await readdir(current)) {
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
