export type EditorRuntimeConfig = {
	initialAlgorithm: unknown | null;
	title: string | null;
	hostKind: "web" | "electron" | "vscode";
	isExam: boolean;
	prettifyInitialAlgorithm: boolean;
};

const runtimeConfigPattern =
	/(<script type="application\/json" id="algoforge-runtime-config">)[\s\S]*?(<\/script>)/;

export function injectEditorRuntimeConfig(
	content: string,
	config: EditorRuntimeConfig,
): string {
	const serialized = JSON.stringify(config).replaceAll("<", "\\u003c");
	if (!runtimeConfigPattern.test(content)) {
		throw new Error("Editor runtime configuration marker is missing.");
	}
	return content.replace(runtimeConfigPattern, `$1${serialized}$2`);
}

export function defaultEditorRuntimeConfig(): EditorRuntimeConfig {
	return {
		initialAlgorithm: null,
		title: null,
		hostKind: "web",
		isExam: false,
		prettifyInitialAlgorithm: false,
	};
}
