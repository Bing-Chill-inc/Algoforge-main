export function injectRuntimeConfig(content, config) {
	const marker = /(<script\s+type="application\/json"\s+id="algoforge-runtime-config"\s*>)[\s\S]*?(<\/script>)/;
	if (!marker.test(content)) {
		throw new Error("Editor runtime configuration marker is missing.");
	}
	const serialized = JSON.stringify(config).replaceAll("<", "\\u003c");
	return content.replace(marker, (_match, opening, closing) => `${opening}${serialized}${closing}`);
}
