import { app, BrowserWindow, protocol } from "electron";
import path from "path";
import fs from "fs";
import AssetsDynamiques from "./assetsDynamiquesForElectron.js";
import getBibliothèque from "./getBibliothequesForElectron.js";
import isExam from "./exam-mode.js";

protocol.registerSchemesAsPrivileged([
	{
		scheme: "app",
		privileges: {
			standard: true,
			secure: true,
			supportFetchAPI: true,
			bypassCSP: true,
		},
	},
]);

// Helper to resolve paths based on environment
const isDev = !app.isPackaged; // Detect if running in development
const staticPath = isDev
	? path.join(path.resolve(), "../front-editeur/src") // Dev path
	: path.join(process.resourcesPath, "src"); // Production path

// Helper function to get MIME types
function getMimeType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case ".html":
			return "text/html";
		case ".js":
			return "application/javascript";
		case ".css":
			return "text/css";
		case ".png":
			return "image/png";
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		case ".svg":
			return "image/svg+xml";
		case ".json":
			return "application/json";
		default:
			return "text/plain";
	}
}

// Electron main window
let mainWindow;

app.on("ready", () => {
	protocol.handle("app", async (request) => {
		const url = new URL(request.url);
		console.log("Request received:", url.pathname);

		// Handle `/Bibliotheque/getStructure`
		if (url.pathname === "/Bibliotheque/getStructure") {
			console.log("Handling dynamic route: /Bibliotheque/getStructure");

			let responseData = null;

			// Simulate Express-like req/res objects
			const fakeReq = {}; // No query parameters needed here
			const fakeRes = {
				setHeader: () => {}, // No-op for headers
				send: (data) => (responseData = data), // Capture response data
			};

			// Invoke the `getBibliothèque` callback
			await getBibliothèque.callback(fakeReq, fakeRes);

			if (responseData) {
				return new Response(responseData, {
					headers: {
						"Content-Type": "application/json",
					},
				});
			}

			console.error(
				"Failed to generate response for /Bibliotheque/getStructure",
			);
			return new Response("Internal Server Error", { status: 500 });
		}

		// Handle dynamic assets (e.g., SVGs in `/assetsDynamiques`)
		if (url.pathname.startsWith("/assetsDynamiques")) {
			const asset = AssetsDynamiques.find(
				(a) => `/assetsDynamiques${a.route}` === url.pathname,
			);
			if (asset) {
				// Simulate Express-like req/res objects
				const fakeReq = { query: Object.fromEntries(url.searchParams) };
				let responseData = null;

				const fakeRes = {
					setHeader: () => {}, // No-op since we're returning directly
					send: (data) => (responseData = data),
				};

				// Invoke the asset's callback to generate dynamic content
				await asset.callback(fakeReq, fakeRes);

				if (responseData) {
					console.log(`Serving dynamic asset: ${url.pathname}`);
					return new Response(responseData, {
						headers: {
							"Content-Type": "image/svg+xml",
						},
					});
				}
			}
			console.error("Dynamic asset not found:", url.pathname);
			return new Response("Not Found", { status: 404 });
		}

		// Handle library icons
		if (
			url.pathname.startsWith("/Bibliotheque/") &&
			url.pathname.endsWith("/icone.svg")
		) {
			const cheminIcone = path.join(staticPath, url.pathname);

			console.log(cheminIcone);

			const lireContenuFichier = (chemin) => {
				return fs.existsSync(chemin)
					? fs.readFileSync(chemin, "utf8")
					: "";
			};

			let fileContent = lireContenuFichier(cheminIcone);

			// Replace PHP-style placeholders with query parameters
			const regex = /<\?php echo \$_GET\[[^\]]+\] \?>/g;

			const matches = fileContent.match(regex);

			console.log(matches);
			console.log("url.searchParams", url.searchParams);

			if (matches) {
				matches.forEach((match) => {
					try {
						const variableRegex = /\$_GET\['([^\]]+)'\]/g;
						const variableObj = variableRegex.exec(match);
						console.log(variableObj);
						const variable = variableObj[1];
						const valeur = Object.fromEntries(url.searchParams)[
							variable
						];
						console.log(variable, valeur);
						fileContent = fileContent.replace(match, valeur);
					} catch (e) {
						console.error(e);
					}
				});
			}

			console.log(`Serving library icon: ${url.pathname}`);
			return new Response(fileContent, {
				headers: {
					"Content-Type": "image/svg+xml",
				},
			});
		}

		if (url.pathname === "/index.html") {
			console.log("Serving exam index.html");
			// On lit index.html, et on trouve la déclaration de la variable `isExam` pour la remplacer par `true`
			const filePath = path.join(staticPath, url.pathname);
			let fileContent = fs.readFileSync(filePath, "utf8");
			if (isExam) {
				fileContent = fileContent.replace(
					"const isExam = false;",
					"const isExam = true;",
				);
			}

			fileContent = fileContent.replace(
				"const isElectron = false;",
				"const isElectron = true;",
			);

			// Reproduit le comportement du backend /edit pour les soumissions du transferForm.
			if (request.method === "POST") {
				try {
					const formData = await request.formData();
					const corpAlgo = formData.get("corpAlgo");
					const nomFichier = formData.get("nomFichier");

					// Chargement du contenu de l'algorithme.
					if (typeof corpAlgo === "string" && corpAlgo.length > 0) {
						let algoContent = JSON.parse(corpAlgo);
						if (typeof algoContent === "string") {
							algoContent = JSON.parse(algoContent);
						}
						algoContent = JSON.stringify(algoContent);
						fileContent = fileContent.replace(
							"</html>",
							`<script>editeur._espacePrincipal.chargerDepuisJSON(${algoContent});</script></html>`,
						);
					}

					// Chargement du titre de l'algorithme.
					if (typeof nomFichier === "string" && nomFichier.length > 0) {
						const safeNomFichier = JSON.stringify(nomFichier);
						fileContent = fileContent.replace(
							"</html>",
							`<script>titreAlgo.innerText = ${safeNomFichier};
							document.title = "Algoforge - " + ${safeNomFichier};</script></html>`,
						);
					}
				} catch (error) {
					console.error(
						"Failed to parse posted algorithm data for /index.html",
						error,
					);
				}
			}

			console.log("Serving exam index.html");

			return new Response(fileContent, {
				headers: {
					"Content-Type": "text/html",
				},
			});
		}

		// Serve static files
		const filePath = path.join(staticPath, url.pathname);
		if (fs.existsSync(filePath)) {
			console.log("Serving static file:", filePath);
			return new Response(fs.readFileSync(filePath), {
				headers: {
					"Content-Type": getMimeType(filePath),
				},
			});
		}

		// Log missing files or unhandled routes
		console.error("File or route not found:", url.pathname);
		return new Response("Not Found", { status: 404 });
	});

	// Create the Electron BrowserWindow
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false, // Allows the renderer process to use Node.js features directly
			webSecurity: false, // Disable certain security features to allow cookie access
			allowRunningInsecureContent: true,
			devTools: !isExam,
		},
	});

	// Point to the custom protocol URL
	mainWindow.loadURL("app://edit/index.html");
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		mainWindow = new BrowserWindow({
			width: 1200,
			height: 800,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false, // Allows the renderer process to use Node.js features directly
				webSecurity: false, // Disable certain security features to allow cookie access
				devTools: !isExam,
			},
		});

		mainWindow.loadURL("app://edit/index.html");
	}
});
