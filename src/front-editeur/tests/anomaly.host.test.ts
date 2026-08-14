import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { chromium, type Browser } from "@playwright/test";
import { join } from "node:path";

let browser: Browser;
let server: ReturnType<typeof Bun.serve>;

beforeAll(async () => {
	const source = await Bun.file(join(import.meta.dir, "..", "out", "index.html")).text();
	server = Bun.serve({
		hostname: "127.0.0.1",
		port: 0,
		fetch(request) {
			const path = new URL(request.url).pathname;
			if (path === "/Bibliotheque/getStructure") return Response.json([]);
			if (path.startsWith("/assetsDynamiques/") || path.startsWith("/Bibliotheque/")) {
				return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { headers: { "content-type": "image/svg+xml" } });
			}
			const isExam = path === "/exam";
			const hostKind = path === "/electron" ? "electron" : "web";
			const config = JSON.stringify({ initialAlgorithm: null, title: null, hostKind, isExam, prettifyInitialAlgorithm: false });
			return new Response(source.replace(
				'{"initialAlgorithm":null,"title":null,"hostKind":"web","isExam":false,"prettifyInitialAlgorithm":false}',
				config,
			), { headers: { "content-type": "text/html; charset=utf-8" } });
		},
	});
	browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
	await browser?.close();
	server?.stop(true);
});

describe("anomaly host availability", () => {
	test("is available but disabled by default in standard Electron", async () => {
		const page = await browser.newPage();
		await page.route("https://plausible.feror.fr/**", (route) => route.abort());
		await page.goto(`http://127.0.0.1:${server.port}/electron`);
		await page.waitForFunction(() => customElements.get("editeur-interface") !== undefined);
		expect(await page.locator("#anomaly_btn").count()).toBe(0);
		await page.locator("#MenuCompte").click();
		await page.getByRole("switch", { name: "Activer la détection des anomalies" }).click();
		await page.locator("#anomaly_btn").waitFor();
		expect(await page.locator("#anomaly_btn").count()).toBe(1);
		await page.close();
	});

	test("runtime exam guard prevents UI and execution", async () => {
		const page = await browser.newPage();
		await page.route("https://plausible.feror.fr/**", (route) => route.abort());
		await page.goto(`http://127.0.0.1:${server.port}/exam`);
		await page.waitForFunction(() => customElements.get("editeur-interface") !== undefined);
		expect(await page.locator("#anomaly_btn").count()).toBe(0);
		expect(await page.locator('style[data-feature="anomaly-detection"]').count()).toBe(0);
		await page.evaluate(() => {
			(document.querySelector("menu-compte-element") as HTMLElement & { ouvrirMenu(): void }).ouvrirMenu();
		});
		expect(await page.getByRole("switch", { name: "Activer la détection des anomalies" }).count()).toBe(0);
		await page.close();
	});
});
