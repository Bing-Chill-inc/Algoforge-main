import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { chromium, type Browser } from "@playwright/test";
import { join } from "node:path";

let browser: Browser;
let server: ReturnType<typeof Bun.serve>;

beforeAll(async () => {
	const html = await Bun.file(join(import.meta.dir, "..", "out", "index.html")).text();
	server = Bun.serve({
		hostname: "127.0.0.1",
		port: 0,
		fetch(request) {
			const path = new URL(request.url).pathname;
			if (path === "/Bibliotheque/getStructure") return Response.json([]);
			if (path.startsWith("/assetsDynamiques/") || path.startsWith("/Bibliotheque/")) {
				return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { headers: { "content-type": "image/svg+xml" } });
			}
			return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
		},
	});
	browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
	await browser?.close();
	server?.stop(true);
});

describe("anomaly drawer", () => {
	test("updates while closed, filters, navigates, and fixes with single-step history", async () => {
		const page = await browser.newPage();
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.route("https://plausible.feror.fr/**", (route) => route.abort());
		await page.goto(`http://127.0.0.1:${server.port}/`);
		await page.waitForFunction(() => customElements.get("editeur-interface") !== undefined);
		expect(await page.locator("#anomaly_btn").count()).toBe(0);
		await page.locator("#MenuCompte").click();
		const anomalySwitch = page.getByRole("switch", { name: "Activer la détection des anomalies" });
		expect(await anomalySwitch.getAttribute("aria-checked")).toBe("false");
		await anomalySwitch.click();
		await page.locator("#anomaly_btn").waitFor();
		expect(await page.evaluate(() => document.cookie.includes("anomalyDetection=true"))).toBe(true);
		await page.reload();
		await page.locator("#anomaly_btn").waitFor();
		await page.evaluate(() => {
			const editor = document.querySelector("editeur-interface") as HTMLElement & { replaceDocument(value: unknown[]): void };
			editor.replaceDocument([
				{ typeElement: "Probleme", abscisse: "20vw", ordonnee: "10vw", libelle: "résultat = 1", listeDonnes: [], listeResultats: [], enfants: [] },
				{ typeElement: "DictionnaireDonnee", types: {}, signification: {} },
			]);
		});
		await page.waitForFunction(() => document.querySelector(".anomaly-error-count")?.textContent === "1");
		expect(await page.locator("#anomaly_wrapper").isVisible()).toBe(false);
		await page.evaluate(() => (document.querySelector("#anomaly_btn") as HTMLButtonElement).click());
		await page.waitForFunction(() => document.querySelector("#anomaly_wrapper")?.classList.contains("open"));
		await page.locator(".anomaly-filter[data-filter='error']").click();
		expect(await page.locator(".anomaly-card[data-severity='warning']").count()).toBe(0);
		await page.getByRole("button", { name: "Modifier ici" }).click();
		expect(await page.locator("probleme-element").evaluate((element) => element.classList.contains("anomaly-target-error"))).toBe(true);
		await page.getByRole("button", { name: "Utiliser ←" }).click();
		await page.waitForFunction(() => (document.querySelector("editeur-interface") as HTMLElement & { serializeDocument(): Array<{ libelle?: string }> }).serializeDocument()[0]?.libelle === "résultat ← 1");
		await page.locator("#boutonUndo").click();
		expect(await serializedLabel(page)).toBe("résultat = 1");
		await page.locator("#boutonRedo").click();
		expect(await serializedLabel(page)).toBe("résultat ← 1");
		await page.locator(".anomaly-close").click();
		await page.locator("#MenuCompte").click();
		await page.getByRole("switch", { name: "Activer la détection des anomalies" }).click();
		await page.waitForFunction(() => document.querySelector("#anomaly_btn") === null);
		expect(await page.locator("#anomaly_wrapper").count()).toBe(0);
		expect(await page.locator('style[data-feature="anomaly-detection"]').count()).toBe(0);
		expect(await page.evaluate(() => document.cookie.includes("anomalyDetection=false"))).toBe(true);
		expect(errors).toEqual([]);
		await page.close();
	}, 15_000);
});

async function serializedLabel(page: import("@playwright/test").Page): Promise<string | undefined> {
	return page.evaluate(() =>
		(document.querySelector("editeur-interface") as HTMLElement & { serializeDocument(): Array<{ libelle?: string }> }).serializeDocument()[0]?.libelle,
	);
}
