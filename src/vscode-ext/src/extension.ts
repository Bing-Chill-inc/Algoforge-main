import * as vscode from "vscode";
import {
	AlgoForgeEditorProvider,
	createNewAlgorithm,
	reopenAsText,
} from "./AlgoForgeEditorProvider";

export function activate(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		AlgoForgeEditorProvider.register(context),
		vscode.commands.registerCommand(
			"algoforge.newAlgorithm",
			createNewAlgorithm,
		),
		vscode.commands.registerCommand(
			"algoforge.reopenAsText",
			reopenAsText,
		),
	);
}

export function deactivate(): void {}
