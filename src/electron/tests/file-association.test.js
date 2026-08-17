import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	registerWindowsFileAssociation,
	unregisterWindowsFileAssociation,
} from "../windows-file-association.js";

const electronDirectory = path.dirname(
	path.dirname(fileURLToPath(import.meta.url)),
);

describe("desktop file association declarations", () => {
	test("registers .af as AlgoForge's Windows document type", () => {
		const calls = [];
		const runner = (command, args) => {
			calls.push([command, args]);
			return "";
		};

		registerWindowsFileAssociation("C:\\Apps\\AlgoForge.exe", runner);

		expect(
			calls.some(([, args]) => args.includes("AlgoForge.Algorithm")),
		).toBe(true);
		expect(
			calls.some(([, args]) =>
				args.includes('"C:\\Apps\\AlgoForge.exe" "%1"'),
			),
		).toBe(true);
		expect(
			calls.some(([, args]) =>
				args.includes("Software\\AlgoForge\\Capabilities"),
			),
		).toBe(true);
	});

	test("does not remove another Windows default during uninstall", () => {
		const calls = [];
		const runner = (command, args) => {
			calls.push([command, args]);
			return args[0] === "query" ? "REG_SZ Other.Application" : "";
		};

		unregisterWindowsFileAssociation("C:\\Apps\\AlgoForge.exe", runner);

		expect(
			calls.some(
				([, args]) =>
					args[0] === "delete" &&
					args[1].endsWith("\\.af") &&
					args.includes("/ve"),
			),
		).toBe(false);
	});

	test("declares macOS and Linux package associations", () => {
		const packageJson = JSON.parse(
			fs.readFileSync(
				path.join(electronDirectory, "package.json"),
				"utf8",
			),
		);
		const forge = packageJson.config.forge;
		const documentType =
			forge.packagerConfig.extendInfo.CFBundleDocumentTypes[0];
		expect(documentType.CFBundleTypeExtensions).toContain("af");
		expect(documentType.LSHandlerRank).toBe("Owner");

		for (const makerName of [
			"@electron-forge/maker-deb",
			"@electron-forge/maker-rpm",
		]) {
			const maker = forge.makers.find(({ name }) => name === makerName);
			expect(maker.config.options.mimeType).toContain(
				"application/vnd.algoforge+json",
			);
		}
	});
});
