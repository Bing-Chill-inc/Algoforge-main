import { join, resolve } from "node:path";

type ExtensionManifest = {
	name: string;
	publisher: string;
	version: string;
};

const projectRoot = import.meta.dir;
const repositoryRoot = resolve(projectRoot, "..", "..");
const args = new Set(process.argv.slice(2));
const packageOnly = args.has("--package-only");
const dryRun = args.has("--dry-run");
const useAzureCredential = args.has("--azure-credential");
const assumeYes = args.has("--yes");
const supportedArguments = new Set([
	"--package-only",
	"--dry-run",
	"--azure-credential",
	"--yes",
]);

for (const argument of args) {
	if (!supportedArguments.has(argument)) {
		throw new Error(`Unknown publish argument: ${argument}`);
	}
}
if (packageOnly && (useAzureCredential || assumeYes)) {
	throw new Error("--package-only cannot be combined with publishing options.");
}
if (useAzureCredential && process.env.VSCE_PAT) {
	throw new Error("Choose either --azure-credential or VSCE_PAT, not both.");
}

const manifest = await Bun.file(
	join(projectRoot, "package.json"),
).json() as ExtensionManifest;
if (!/^[a-z0-9][a-z0-9-]*$/i.test(manifest.publisher)) {
	throw new Error(`Invalid Marketplace publisher ID: ${manifest.publisher}`);
}
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifest.version)) {
	throw new Error(`Invalid extension version: ${manifest.version}`);
}

const extensionId = `${manifest.publisher}.${manifest.name}`;
const vsixPath = join(
	projectRoot,
	"out",
	`${manifest.name}-${manifest.version}.vsix`,
);

if (!packageOnly && !dryRun) {
	await assertCommittedAndPushed();
	if (!useAzureCredential && !process.env.VSCE_PAT) {
		throw new Error(
			"Set VSCE_PAT to a Marketplace Manage PAT, or pass --azure-credential.",
		);
	}
}

await run(["bun", "run", "check"]);
await run([
	"bunx",
	"@vscode/vsce",
	"package",
	"--no-dependencies",
	"--out",
	vsixPath,
]);
await run(["bun", "run", "verifyPackage.ts", vsixPath]);

if (packageOnly || dryRun) {
	console.log(
		`${dryRun ? "Dry run complete" : "Packaged"}: ${extensionId}@${manifest.version}`,
	);
	console.log(vsixPath);
	process.exit(0);
}

if (!assumeYes) {
	const answer = prompt(
		`Publish ${extensionId}@${manifest.version} to the VS Code Marketplace? Type "publish" to continue:`,
	);
	if (answer !== "publish") throw new Error("Marketplace publication cancelled.");
}

const publishArguments = [
	"bunx",
	"@vscode/vsce",
	"publish",
	"--no-dependencies",
	"--packagePath",
	vsixPath,
];
if (useAzureCredential) publishArguments.push("--azure-credential");
await run(publishArguments);
console.log(`Published ${extensionId}@${manifest.version}.`);

async function assertCommittedAndPushed(): Promise<void> {
	const status = await capture(["git", "status", "--porcelain"]);
	if (status.trim()) {
		throw new Error(
			"Refusing to publish from a dirty repository. Commit or stash all changes first.",
		);
	}
	const head = (await capture(["git", "rev-parse", "HEAD"])).trim();
	let upstream: string;
	try {
		upstream = (await capture(["git", "rev-parse", "@{upstream}"])).trim();
	} catch {
		throw new Error("The current branch has no configured upstream.");
	}
	if (head !== upstream) {
		throw new Error(
			"Refusing to publish a commit that is not the current upstream revision. Push first.",
		);
	}
}

async function capture(command: string[]): Promise<string> {
	const process = Bun.spawn(command, {
		cwd: repositoryRoot,
		stdout: "pipe",
		stderr: "pipe",
	});
	const stdout = await new Response(process.stdout).text();
	const stderr = await new Response(process.stderr).text();
	if ((await process.exited) !== 0) {
		throw new Error(stderr.trim() || `${command.join(" ")} failed.`);
	}
	return stdout;
}

async function run(command: string[]): Promise<void> {
	console.log(`> ${command.join(" ")}`);
	const process = Bun.spawn(command, {
		cwd: projectRoot,
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
	});
	const exitCode = await process.exited;
	if (exitCode !== 0) {
		throw new Error(`${command.join(" ")} exited with code ${exitCode}.`);
	}
}
