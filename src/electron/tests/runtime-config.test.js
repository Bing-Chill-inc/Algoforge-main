import { expect, test } from "bun:test";
import { injectRuntimeConfig } from "../runtime-config.js";
import { injectEditorRuntimeConfig } from "../../back/editorRuntimeConfig.ts";

for (const inject of [injectRuntimeConfig, injectEditorRuntimeConfig]) {
	test(`${inject.name} injects configuration into the built desktop artifact`, async () => {
		const html = await Bun.file(new URL("../../front-editeur/out/index.html", import.meta.url)).text();
		const config = { title: "$& </script>", hostKind: "electron", isExam: true, initialAlgorithm: null, prettifyInitialAlgorithm: false };
		const result = inject(html, config);
		const json = result.match(/<script\s+type="application\/json"\s+id="algoforge-runtime-config"\s*>([\s\S]*?)<\/script>/)[1];
		expect(JSON.parse(json)).toEqual(config);
		expect(json).not.toContain("</script>");
	});
}
