import type { EmbeddedPreviewTheme } from "../../../common/embeddedEditorProtocol";
import {
	createImportedDocument,
	hostReady,
	initializeDocumentController,
	isEmbeddedHost,
	onHostMessage,
	openExternal,
	reportHostError,
	postHostMessage,
} from "./host";
import { editeur, preferences, titreAlgo } from "./runtime";

export function initializeEmbeddedIntegration(): void {
	if (!isEmbeddedHost()) return;

	titreAlgo.contentEditable = "false";
	titreAlgo.nextElementSibling?.setAttribute("hidden", "true");
	const preferencesMenu = document.querySelector<HTMLElement>(
		"menu-compte-element",
	);
	preferencesMenu?.setAttribute("title", "Editor preferences");
	preferencesMenu?.setAttribute("aria-label", "Editor preferences");
	document.querySelector<HTMLElement>(".zoneActionsCloud")?.setAttribute(
		"hidden",
		"true",
	);
	const documentController = initializeDocumentController(() =>
		editeur.serializeDocument(),
	);
	new MutationObserver(() => {
		const selectedTheme = editeur._themeSelect?.selectedOptions?.[0];
		if (selectedTheme?.nom === "VS Code") selectedTheme.appliquer();
	}).observe(document.body, {
		attributes: true,
		attributeFilter: ["class", "data-vscode-theme-id", "data-vscode-theme-kind"],
	});

	onHostMessage((message) => {
		try {
			if (message.type === "initialize" || message.type === "replaceDocument") {
				titreAlgo.innerText = message.title;
				document.title = `AlgoForge - ${message.title}`;
				documentController.replaceAuthoritative(message.version, () =>
					editeur.replaceDocument(message.algorithm),
				);
				if (message.type === "initialize") {
					editeur._bibliotheque.initializeHostData(
						message.library ?? [],
						message.customLibrary ?? [],
					);
					const savedTheme = message.preferences?.theme;
					if (
						savedTheme &&
						Array.from(editeur._themeSelect.options).some(
							(option: HTMLOptionElement) => option.value === savedTheme,
						)
					) {
						editeur._themeSelect.value = savedTheme;
						editeur._themeSelect.selectedOptions[0].appliquer();
					}
					if (typeof message.preferences?.glow === "boolean") {
						preferences.glow = message.preferences.glow;
						const displayer = document.querySelector<HTMLElement>(
							"#switchGlowDisplayer",
						);
						const container = document.querySelector<HTMLElement>(
							"#switchGlowContainer",
						);
						if (displayer && container) {
							displayer.style.left = preferences.glow ? "auto" : "2px";
							displayer.style.right = preferences.glow ? "2px" : "auto";
							container.style.backgroundColor = preferences.glow
								? "var(--titleColor)"
								: "var(--fgColorSemiTransparent)";
						}
					}
				}
			}
			if (message.type === "editAccepted") {
				documentController.accept(message.editId, message.version);
			}
			if (message.type === "editRejected") {
				titreAlgo.innerText = message.title;
				documentController.replaceAuthoritative(message.version, () =>
					editeur.replaceDocument(message.algorithm),
				);
				if (message.error) reportHostError(message.error);
			}
			if (message.type === "renderPreview") {
				void renderPreview(message.requestId, message.algorithm, message.title, message.theme);
			}
			if (message.type === "importSource") {
				const imported = editeur.interpreterFichierAlgorithme(
					message.name,
					message.content,
				);
				createImportedDocument(
					imported.nomAlgo || editeur.retirerExtensionNomFichier(message.name),
					imported.algo,
				);
			}
		} catch (error) {
			reportHostError(
				error instanceof Error ? error.message : "Unable to update the editor.",
			);
		}
	});

	document.addEventListener("click", (event) => {
		const anchor =
			event.target instanceof Element ? event.target.closest("a[href]") : null;
		if (!(anchor instanceof HTMLAnchorElement)) return;
		const href = anchor.href;
		if (!href.startsWith("http://") && !href.startsWith("https://")) return;
		event.preventDefault();
		openExternal(href);
	});

	hostReady();
}

async function waitForPreviewLayout(): Promise<void> {
	await new Promise<void>((resolve) => {
		let finished = false;
		const finish = (): void => {
			if (finished) return;
			finished = true;
			window.clearTimeout(timeout);
			resolve();
		};
		const timeout = window.setTimeout(finish, 250);
		requestAnimationFrame(() => requestAnimationFrame(finish));
	});
	if (document.fonts) {
		await Promise.race([
			document.fonts.ready.then(() => undefined),
			new Promise<void>((resolve) => window.setTimeout(resolve, 1_000)),
		]);
	}
}

function preparePreviewSvg(svg: string, theme?: EmbeddedPreviewTheme): string {
	const planStyle = /<plan-travail\b[^>]*\bstyle="([^"]*)"/i.exec(svg)?.[1] ?? "";
	const widthValue = /(?:^|;)\s*width\s*:\s*([0-9.]+)vw/i.exec(planStyle)?.[1];
	const heightValue = /(?:^|;)\s*height\s*:\s*([0-9.]+)vw/i.exec(planStyle)?.[1];
	const viewportScale = (document.documentElement.clientWidth || window.innerWidth || 1280) / 100;
	const width = widthValue ? Number(widthValue) : undefined;
	const height = heightValue ? Number(heightValue) : undefined;
	let result = svg.replace(/(-?[0-9]+(?:\.[0-9]+)?)vw\b/g, (_match, value: string) =>
		(Number(value) * viewportScale).toString() + "px");
	result = result.replace("</style>", "plan-travail{background-color:transparent!important;border:none!important}</style>");
	if (width && height) {
		const pixelWidth = width * viewportScale;
		const pixelHeight = height * viewportScale;
		const root = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " + pixelWidth + " " + pixelHeight + "\" width=\"" + pixelWidth + "\" height=\"" + pixelHeight + "\" preserveAspectRatio=\"xMidYMid meet\">";
		result = result.replace(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg">/, root);
	}
	if (theme) {
		result = replaceSvgColor(result, "#ffffff", theme.background);
		result = replaceSvgColor(result, "#222222", theme.foreground);
		result = replaceSvgColor(result, "#000000", theme.foreground);
		result = replaceSvgColor(result, "#838787", theme.foreground);
	}
	return result;
}

function replaceSvgColor(svg: string, source: string, replacement: string): string {
	return svg.replace(new RegExp(source + "(?![0-9a-f])", "gi"), replacement);
}

async function renderPreview(
	requestId: number,
	algorithm: unknown[],
	title: string,
	theme?: EmbeddedPreviewTheme,
): Promise<void> {
	try {
		titreAlgo.innerText = title;
		editeur.replaceDocument(algorithm);
		await waitForPreviewLayout();
		const rawSvg = editeur.exporterSVG(editeur._planActif as never, false, false);
		const svg = typeof rawSvg === "string" ? preparePreviewSvg(rawSvg, theme) : rawSvg;
		if (typeof svg !== "string" || !svg.includes("<svg")) {
			throw new Error("The editor did not produce an SVG preview.");
		}
		postHostMessage({ type: "previewRendered", requestId, svg });
	} catch (error) {
		postHostMessage({
			type: "previewRendered",
			requestId,
			error: error instanceof Error ? error.message : "Unable to render the preview.",
		});
	}
}
