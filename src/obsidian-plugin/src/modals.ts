import {
	FuzzySuggestModal,
	Modal,
	Setting,
	TFile,
	type App,
} from "obsidian";

export class PathModal extends Modal {
	private value: string;
	private settled = false;
	private resolve!: (value: string | undefined) => void;
	readonly result = new Promise<string | undefined>((resolve) => { this.resolve = resolve; });

	constructor(app: App, private readonly heading: string, initialValue: string) {
		super(app);
		this.value = initialValue;
	}

	onOpen(): void {
		this.titleEl.setText(this.heading);
		new Setting(this.contentEl)
			.setName("Vault-relative path")
			.addText((text) => {
				text.setValue(this.value).onChange((value) => { this.value = value; });
				text.inputEl.addEventListener("keydown", (event) => {
					if (event.key === "Enter") this.finish(this.value);
				});
				setTimeout(() => text.inputEl.select());
			});
		new Setting(this.contentEl)
			.addButton((button) => button.setButtonText("Cancel").onClick(() => this.finish(undefined)))
			.addButton((button) => button.setCta().setButtonText("Confirm").onClick(() => this.finish(this.value)));
	}

	onClose(): void {
		this.contentEl.empty();
		if (!this.settled) this.finish(undefined);
	}

	private finish(value: string | undefined): void {
		if (this.settled) return;
		this.settled = true;
		this.resolve(value);
		this.close();
	}
}

export class FileSuggestModal extends FuzzySuggestModal<TFile> {
	private settled = false;
	private resolve!: (value: TFile | undefined) => void;
	readonly result = new Promise<TFile | undefined>((resolve) => { this.resolve = resolve; });

	constructor(app: App, private readonly files: TFile[], placeholder: string) {
		super(app);
		this.setPlaceholder(placeholder);
	}

	getItems(): TFile[] { return this.files; }
	getItemText(file: TFile): string { return file.path; }
	onChooseItem(file: TFile): void { this.finish(file); }
	onClose(): void {
		super.onClose();
		if (!this.settled) this.finish(undefined);
	}

	private finish(file: TFile | undefined): void {
		if (this.settled) return;
		this.settled = true;
		this.resolve(file);
		if (file === undefined) super.close();
	}
}
