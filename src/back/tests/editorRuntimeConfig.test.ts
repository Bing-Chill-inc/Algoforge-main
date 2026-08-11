import { describe, expect, test } from "bun:test";
import {
	defaultEditorRuntimeConfig,
	injectEditorRuntimeConfig,
} from "../editorRuntimeConfig";

const html =
	'<script type="application/json" id="algoforge-runtime-config">{}</script>';

describe("editor runtime configuration", () => {
	test("replaces the marker with escaped JSON", () => {
		const config = defaultEditorRuntimeConfig();
		config.title = "</script><script>alert(1)</script>";
		const result = injectEditorRuntimeConfig(html, config);

		expect(result).not.toContain("</script><script>alert(1)");
		expect(result).toContain("\\u003c/script>");
		expect(result).toContain('"isElectron":false');
		expect(result).toContain('"prettifyInitialAlgorithm":false');
	});

	test("rejects an artifact without the marker", () => {
		expect(() =>
			injectEditorRuntimeConfig("<html></html>", defaultEditorRuntimeConfig()),
		).toThrow("marker is missing");
	});
});
