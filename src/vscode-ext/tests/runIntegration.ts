import { join } from "node:path";
import { runTests } from "@vscode/test-electron";

const extensionDevelopmentPath = join(import.meta.dir, "..");
const extensionTestsPath = join(
	extensionDevelopmentPath,
	"dist",
	"test",
	"index.js",
);

try {
	await runTests({
		extensionDevelopmentPath,
		extensionTestsPath,
		launchArgs: ["--disable-extensions"],
	});
} catch (error) {
	console.error(error);
	process.exitCode = 1;
}
