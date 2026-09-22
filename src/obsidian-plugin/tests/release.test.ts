import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { MIRROR_FILES, stageRelease, validateReleaseMetadata } from "../scripts/prepare-release";

const temporaryDirectories: string[] = [];
const pluginRoot = join(import.meta.dir, "..");
const currentVersion = JSON.parse(await readFile(join(pluginRoot, "manifest.json"), "utf8")).version as string;

afterEach(async () => {
	await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("Obsidian release publication", () => {
	test("validates synchronized release metadata", () => {
		expect(() => validateReleaseMetadata(
			"2.3.4",
			{ version: "2.3.4" },
			{ version: "2.3.4", minAppVersion: "1.6.0" },
			{ "2.3.4": "1.6.0" },
		)).not.toThrow();
		expect(() => validateReleaseMetadata(
			"2.3.4",
			{ version: "2.3.3" },
			{ version: "2.3.4", minAppVersion: "1.6.0" },
			{ "2.3.4": "1.6.0" },
		)).toThrow("package.json version");
		expect(() => validateReleaseMetadata(
			"v2.3.4",
			{ version: "v2.3.4" },
			{ version: "v2.3.4", minAppVersion: "1.6.0" },
			{ "v2.3.4": "1.6.0" },
		)).toThrow("numeric SemVer");
	});

	test("stages release assets and the exact reviewable source snapshot", async () => {
		const temporary = await makeTemporaryDirectory();
		const output = join(temporary, "release");
		await stageRelease(pluginRoot, output, currentVersion);
		const files = await listFiles(output);
		for (const file of MIRROR_FILES) expect(files).toContain(file);
		for (const file of [
			"src/obsidian-plugin/src/main.ts",
			"src/obsidian-plugin/build.ts",
			"src/common/embeddedEditorProtocol.ts",
			"docs/embedded-editor/src/front-editeur/src/main.ts",
			"docs/embedded-editor/src/front-editeur/build.ts",
			"docs/embedded-editor/src/back/assetsDynamiques.ts",
		]) {
			expect(files).toContain(file);
		}
		expect(files.some((file) => file.startsWith("src/front-editeur/") || file.startsWith("src/back/"))).toBe(false);
		expect(files.some((file) => file.includes("/dist/") || file.includes("/node_modules/"))).toBe(false);
		expect(await readFile(join(output, "src/obsidian-plugin/src/main.ts"), "utf8"))
			.toBe(await readFile(join(pluginRoot, "src/main.ts"), "utf8"));
	});

	test("attests assets in both repositories and releases only supported files", async () => {
		const sourceWorkflow = await readFile(
			join(pluginRoot, "..", "..", ".github/workflows/publish-obsidian.yml"), "utf8",
		);
		const mirrorWorkflow = await readFile(
			join(pluginRoot, "release-repo/.github/workflows/release.yml"), "utf8",
		);
		expect(sourceWorkflow).toContain("actions/attest@v4");
		expect(mirrorWorkflow).toContain("actions/attest@v4");
		expect(mirrorWorkflow).toContain("gh attestation verify");
		expect(mirrorWorkflow).toContain('gh release create "$VERSION" main.js manifest.json styles.css');
		expect(mirrorWorkflow).not.toContain(".zip");
		expect(sourceWorkflow).toContain("scripts/advance-main.sh");
		expect(mirrorWorkflow).not.toContain("git push origin");
	});

	test("publishes immutable tags and safely accepts an identical rerun", async () => {
		const temporary = await makeTemporaryDirectory();
		const remote = join(temporary, "remote.git");
		const seed = join(temporary, "seed");
		const staged = join(temporary, "staged");
		await stageRelease(pluginRoot, staged, currentVersion);

		run(["git", "init", "--bare", "--initial-branch=main", remote]);
		run(["git", "init", "--initial-branch=main", seed]);
		run(["git", "-C", seed, "config", "user.name", "Release test"]);
		run(["git", "-C", seed, "config", "user.email", "release@example.invalid"]);
		await Bun.write(join(seed, "README.md"), "bootstrap\n");
		run(["git", "-C", seed, "add", "README.md"]);
		run(["git", "-C", seed, "commit", "-m", "Bootstrap"]);
		run(["git", "-C", seed, "remote", "add", "origin", remote]);
		run(["git", "-C", seed, "push", "origin", "main"]);
		const initialMain = run(["git", "--git-dir", remote, "rev-parse", "refs/heads/main"]).stdout.trim();

		const script = join(pluginRoot, "scripts", "publish-tag.sh");
		const first = run([script, staged, remote, currentVersion, join(temporary, "first")]);
		expect(first.stdout).toContain("Published destination tag");
		expect(run(["git", "--git-dir", remote, "rev-parse", "refs/heads/main"]).stdout.trim()).toBe(initialMain);
		const releaseCommit = run(["git", "--git-dir", remote, "rev-parse", `refs/tags/${currentVersion}`]).stdout.trim();
		expect(releaseCommit).not.toBe("");
		const advanceScript = join(pluginRoot, "scripts", "advance-main.sh");
		const advance = run([advanceScript, join(temporary, "first", "mirror"), currentVersion]);
		expect(advance.stdout).toContain("Advanced destination main");
		expect(run(["git", "--git-dir", remote, "rev-parse", "refs/heads/main"]).stdout.trim()).toBe(releaseCommit);
		const alreadyAdvanced = run([advanceScript, join(temporary, "first", "mirror"), currentVersion]);
		expect(alreadyAdvanced.stdout).toContain("already contains release");

		const rerun = run([script, staged, remote, currentVersion, join(temporary, "rerun")]);
		expect(rerun.stdout).toContain("already contains the same release tree");

		await Bun.write(join(staged, "README.md"), "conflicting release\n");
		const conflict = Bun.spawnSync([script, staged, remote, currentVersion, join(temporary, "conflict")], {
			env: { ...process.env, GITHUB_SHA: "test-source" },
		});
		expect(conflict.exitCode).toBe(1);
		expect(conflict.stderr.toString()).toContain("different contents");
	});
});

async function makeTemporaryDirectory(): Promise<string> {
	const path = await mkdtemp(join(tmpdir(), "algoforge-obsidian-release-"));
	temporaryDirectories.push(path);
	return path;
}

function run(command: string[]): { stdout: string; stderr: string } {
	const result = Bun.spawnSync(command, { env: { ...process.env, GITHUB_SHA: "test-source" } });
	const stdout = result.stdout.toString();
	const stderr = result.stderr.toString();
	if (result.exitCode !== 0) throw new Error(`${command.join(" ")} failed:\n${stdout}\n${stderr}`);
	return { stdout, stderr };
}

async function listFiles(root: string, current = root): Promise<string[]> {
	const files: string[] = [];
	for (const entry of await readdir(current, { withFileTypes: true })) {
		const path = join(current, entry.name);
		if (entry.isDirectory()) files.push(...await listFiles(root, path));
		else files.push(path.slice(root.length + 1).replaceAll("\\", "/"));
	}
	return files.sort();
}
