import path from "node:path";
import { execFileSync } from "node:child_process";

const PROG_ID = "AlgoForge.Algorithm";
const CLASSES_ROOT = "HKCU\\Software\\Classes";
const CAPABILITIES_ROOT = "HKCU\\Software\\AlgoForge\\Capabilities";
const REGISTERED_APPLICATIONS = "HKCU\\Software\\RegisteredApplications";

function runRegistry(arguments_, runner) {
	try {
		return runner("reg.exe", arguments_, {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return "";
	}
}

function addValue(key, name, value, runner) {
	const nameArguments = name === null ? ["/ve"] : ["/v", name];
	runRegistry(
		["add", key, ...nameArguments, "/t", "REG_SZ", "/d", value, "/f"],
		runner,
	);
}

export function registerWindowsFileAssociation(
	executablePath,
	runner = execFileSync,
) {
	const command = `\"${executablePath}\" \"%1\"`;
	const executableName = path.basename(executablePath);

	addValue(`${CLASSES_ROOT}\\.af`, null, PROG_ID, runner);
	addValue(`${CLASSES_ROOT}\\.af\\OpenWithProgids`, PROG_ID, "", runner);
	addValue(
		`${CLASSES_ROOT}\\${PROG_ID}`,
		null,
		"AlgoForge Algorithm",
		runner,
	);
	addValue(
		`${CLASSES_ROOT}\\${PROG_ID}\\DefaultIcon`,
		null,
		`\"${executablePath}\",0`,
		runner,
	);
	addValue(
		`${CLASSES_ROOT}\\${PROG_ID}\\shell\\open\\command`,
		null,
		command,
		runner,
	);
	addValue(
		`${CLASSES_ROOT}\\Applications\\${executableName}\\SupportedTypes`,
		".af",
		"",
		runner,
	);
	addValue(
		`${CLASSES_ROOT}\\Applications\\${executableName}\\shell\\open\\command`,
		null,
		command,
		runner,
	);

	addValue(CAPABILITIES_ROOT, "ApplicationName", "AlgoForge", runner);
	addValue(
		CAPABILITIES_ROOT,
		"ApplicationDescription",
		"Create and edit AlgoForge algorithm documents",
		runner,
	);
	addValue(`${CAPABILITIES_ROOT}\\FileAssociations`, ".af", PROG_ID, runner);
	addValue(
		REGISTERED_APPLICATIONS,
		"AlgoForge",
		"Software\\AlgoForge\\Capabilities",
		runner,
	);
}

export function unregisterWindowsFileAssociation(
	executablePath,
	runner = execFileSync,
) {
	const executableName = path.basename(executablePath);
	const extensionKey = `${CLASSES_ROOT}\\.af`;
	const currentDefault = runRegistry(["query", extensionKey, "/ve"], runner);
	if (
		new RegExp(`REG_SZ\\s+${PROG_ID.replace(".", "\\.")}`).test(
			currentDefault,
		)
	) {
		runRegistry(["delete", extensionKey, "/ve", "/f"], runner);
	}

	runRegistry(
		["delete", `${extensionKey}\\OpenWithProgids`, "/v", PROG_ID, "/f"],
		runner,
	);
	runRegistry(["delete", `${CLASSES_ROOT}\\${PROG_ID}`, "/f"], runner);
	runRegistry(
		["delete", `${CLASSES_ROOT}\\Applications\\${executableName}`, "/f"],
		runner,
	);
	runRegistry(["delete", CAPABILITIES_ROOT, "/f"], runner);
	runRegistry(
		["delete", REGISTERED_APPLICATIONS, "/v", "AlgoForge", "/f"],
		runner,
	);
}
