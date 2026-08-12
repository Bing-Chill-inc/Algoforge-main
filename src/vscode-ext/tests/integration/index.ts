import { strict as assert } from "node:assert";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as vscode from "vscode";

const EMPTY_DOCUMENT =
	'[\n  {\n    "typeElement": "DictionnaireDonnee",\n    "types": {},\n    "signification": {}\n  }\n]\n';

export async function run(): Promise<void> {
	const extension = vscode.extensions.getExtension("algoforge.algoforge-vscode");
	assert.ok(extension, "AlgoForge extension is installed in the test host");
	await extension.activate();

	const commands = await vscode.commands.getCommands(true);
	assert.ok(commands.includes("algoforge.newAlgorithm"));
	assert.ok(commands.includes("algoforge.reopenAsText"));

	const customEditors = extension.packageJSON.contributes.customEditors;
	assert.equal(extension.packageJSON.version, "0.1.1");
	const language = extension.packageJSON.contributes.languages[0];
	assert.equal(language.id, "algoforge");
	assert.deepEqual(language.extensions, [".algoforge", ".af"]);
	assert.ok(language.icon.light.endsWith("algoforge-file-light.svg"));
	assert.ok(language.icon.dark.endsWith("algoforge-file-dark.svg"));
	assert.equal(customEditors[0].viewType, "algoforge.visualEditor");
	assert.equal(customEditors[0].priority, "default");
	assert.deepEqual(
		customEditors[0].selector.map(
			(selector: { filenamePattern: string }) => selector.filenamePattern,
		),
		["*.algoforge", "*.af"],
	);

	const testDirectory = vscode.Uri.file(
		join(tmpdir(), `algoforge-vscode-${Date.now()}`),
	);
	await vscode.workspace.fs.createDirectory(testDirectory);
	try {
		for (const extensionName of ["algoforge", "af"]) {
			const uri = vscode.Uri.joinPath(
				testDirectory,
				`sample.${extensionName}`,
			);
			await vscode.workspace.fs.writeFile(uri, Buffer.from(EMPTY_DOCUMENT));
			const textDocument = await vscode.workspace.openTextDocument(uri);
			assert.equal(textDocument.languageId, "algoforge");
			await vscode.commands.executeCommand(
				"vscode.openWith",
				uri,
				"algoforge.visualEditor",
			);
			await new Promise((resolve) => setTimeout(resolve, 300));
			const input = vscode.window.tabGroups.activeTabGroup.activeTab?.input;
			assert.ok(input instanceof vscode.TabInputCustom);
			assert.equal(input.viewType, "algoforge.visualEditor");
			await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
		}

		const emptyUri = vscode.Uri.joinPath(testDirectory, "empty.algoforge");
		await vscode.workspace.fs.writeFile(emptyUri, Buffer.from("  \n"));
		const emptyDocument = await vscode.workspace.openTextDocument(emptyUri);
		await vscode.commands.executeCommand(
			"vscode.openWith",
			emptyUri,
			"algoforge.visualEditor",
		);
		await new Promise((resolve) => setTimeout(resolve, 400));
		assert.equal(emptyDocument.getText(), EMPTY_DOCUMENT);
		assert.equal(emptyDocument.isDirty, true);
		assert.equal(
			Buffer.from(await vscode.workspace.fs.readFile(emptyUri)).toString("utf8"),
			"  \n",
		);
		await vscode.commands.executeCommand("undo");
		await new Promise((resolve) => setTimeout(resolve, 100));
		assert.equal(emptyDocument.getText(), "  \n");
		await vscode.commands.executeCommand("redo");
		await new Promise((resolve) => setTimeout(resolve, 100));
		assert.equal(emptyDocument.getText(), EMPTY_DOCUMENT);
		assert.equal(await emptyDocument.save(), true);
		assert.equal(
			Buffer.from(await vscode.workspace.fs.readFile(emptyUri)).toString("utf8"),
			EMPTY_DOCUMENT,
		);
	} finally {
		await vscode.workspace.fs.delete(testDirectory, {
			recursive: true,
			useTrash: false,
		});
	}
}
