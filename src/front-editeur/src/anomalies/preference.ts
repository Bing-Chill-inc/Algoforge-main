interface PreferenceEditor {
	setCookie(name: string, value: string, days: number): void;
}

interface SettingsOpenedDetail {
	readonly container?: Element | null;
}

export function initializeAnomalyPreference(
	editor: PreferenceEditor,
	initiallyEnabled: boolean,
	onChange: (enabled: boolean) => void,
): () => void {
	let enabled = initiallyEnabled;
	const events = new AbortController();

	document.addEventListener("algoforge:settings-opened", (event) => {
		const container = (event as CustomEvent<SettingsOpenedDetail>).detail?.container;
		if (!(container instanceof HTMLElement) || container.querySelector("#switchAnomalyContainer")) return;

		const option = document.createElement("div");
		option.id = "anomalyDetectionOption";
		option.className = "effect-option";
		const label = document.createElement("span");
		label.textContent = "Détection des anomalies";
		const toggle = document.createElement("button");
		toggle.id = "switchAnomalyContainer";
		toggle.type = "button";
		toggle.className = "switch-container";
		toggle.setAttribute("role", "switch");
		toggle.setAttribute("aria-label", "Activer la détection des anomalies");
		const displayer = document.createElement("span");
		displayer.id = "switchAnomalyDisplayer";
		displayer.className = "switch-displayer";
		toggle.append(displayer);
		option.append(label, toggle);

		const firstEffect = container.querySelector(".effect-option");
		container.insertBefore(option, firstEffect);

		const render = (): void => {
			toggle.setAttribute("aria-checked", String(enabled));
			toggle.style.backgroundColor = enabled ? "var(--titleColor)" : "var(--fgColorSemiTransparent)";
			displayer.style.left = enabled ? "auto" : "2px";
			displayer.style.right = enabled ? "2px" : "auto";
		};
		render();
		toggle.addEventListener("click", () => {
			enabled = !enabled;
			editor.setCookie("anomalyDetection", String(enabled), 365);
			render();
			onChange(enabled);
		}, { signal: events.signal });
	}, { signal: events.signal });

	const openContainer = document.querySelector("#MenuCompteDiv .editor-options");
	if (openContainer) {
		document.dispatchEvent(new CustomEvent("algoforge:settings-opened", {
			detail: { container: openContainer },
		}));
	}

	return () => events.abort();
}
