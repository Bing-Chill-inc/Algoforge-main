import type {
	EditorToHostMessage,
	HostToEditorMessage,
} from "../../common/embeddedEditorProtocol";

interface BridgeEnvelope {
	channel: "algoforge-editor";
	frameId: string;
	message: EditorToHostMessage;
}

export class EditorFrame {
	readonly iframe: HTMLIFrameElement;
	private readonly frameId = crypto.randomUUID();
	private readonly listener: (event: MessageEvent<unknown>) => void;
	private readonly ownerWindow: Window;

	constructor(
		container: HTMLElement,
		html: string,
		onMessage: (message: EditorToHostMessage) => void,
		className = "algoforge-editor-frame",
	) {
		this.ownerWindow = container.ownerDocument.defaultView ?? window;
		this.iframe = container.createEl("iframe", { cls: className });
		this.iframe.setAttribute("sandbox", "allow-scripts");
		this.iframe.setAttribute("title", "AlgoForge visual editor");
		this.listener = (event) => {
			if (event.source !== this.iframe.contentWindow) return;
			const envelope = event.data as Partial<BridgeEnvelope> | null;
			if (
				!envelope ||
				envelope.channel !== "algoforge-editor" ||
				envelope.frameId !== this.frameId ||
				!envelope.message
			) return;
			onMessage(envelope.message);
		};
		this.ownerWindow.addEventListener("message", this.listener);
		this.iframe.srcdoc = prepareEditorHtml(html, this.frameId);
	}

	post(message: HostToEditorMessage): void {
		this.iframe.contentWindow?.postMessage(message, "*");
	}

	destroy(): void {
		this.ownerWindow.removeEventListener("message", this.listener);
		this.iframe.remove();
	}
}

function prepareEditorHtml(html: string, frameId: string): string {
	const nonce = crypto.randomUUID().replaceAll("-", "");
	const config = JSON.stringify({
		initialAlgorithm: null,
		title: null,
		hostKind: "embedded",
		isExam: false,
		prettifyInitialAlgorithm: false,
	}).replaceAll("<", "\\u003c");
	let result = html.replace(
		/(<script type="application\/json" id="algoforge-runtime-config")[^>]*>[\s\S]*?(<\/script>)/,
		`$1>${config}$2`,
	);
	result = result.replace(/<script\b(?![^>]*\bnonce=)/g, `<script nonce="${nonce}"`);
	const bridge = `<script nonce="${nonce}">globalThis.acquireAlgoForgeHostApi=()=>({postMessage(message){parent.postMessage({channel:"algoforge-editor",frameId:${JSON.stringify(frameId)},message},"*")},getState(){return undefined},setState(){}});</script>`;
	const csp = [
		"default-src 'none'",
		"img-src data: blob:",
		"media-src data: blob:",
		"font-src data:",
		`script-src 'nonce-${nonce}'`,
		"style-src 'unsafe-inline'",
	].join("; ");
	return result.replace("<head>", `<head><meta http-equiv="Content-Security-Policy" content="${csp}">${bridge}`);
}
