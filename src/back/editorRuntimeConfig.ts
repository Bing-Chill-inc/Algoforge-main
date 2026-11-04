export type EditorRuntimeConfig = {
	initialAlgorithm: unknown | null;
	title: string | null;
	hostKind: "web" | "electron" | "embedded";
	isExam: boolean;
	prettifyInitialAlgorithm: boolean;
};

const runtimeConfigPattern =
	/(<script\s+type="application\/json"\s+id="algoforge-runtime-config"\s*>)[\s\S]*?(<\/script>)/;

export function injectEditorRuntimeConfig(
	content: string,
	config: EditorRuntimeConfig,
): string {
	const serialized = JSON.stringify(config).replace(/</g, "\\u003c");
	if (!runtimeConfigPattern.test(content)) {
		throw new Error("Editor runtime configuration marker is missing.");
	}
	return content.replace(runtimeConfigPattern, (_match, opening, closing) => `${opening}${serialized}${closing}`);
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
