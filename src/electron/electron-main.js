import { app, BrowserWindow, dialog, protocol } from "electron";
import path from "path";
import fs from "fs";
import squirrelStartup from "electron-squirrel-startup";
import AssetsDynamiques from "./assetsDynamiquesForElectron.js";
import getBibliothèque from "./getBibliothequesForElectron.js";
import isExam from "./exam-mode.js";
import {
	findAlgoForgeFileArguments,
	MAX_ALGOFORGE_FILE_SIZE,
	parseAlgoForgeFile,
} from "./algorithm-file.js";
import {
	registerWindowsFileAssociation,
	unregisterWindowsFileAssociation,
} from "./windows-file-association.js";

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
	? path.join(path.resolve(), "../front-editeur/out")
	: path.join(process.resourcesPath, "out");
const libraryPath = isDev
	? path.join(path.resolve(), "../front-editeur/src")
	: process.resourcesPath;

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

const windowDocuments = new Map();
const queuedFilePaths = new Set();
let nextDocumentId = 0;

function createEditorWindow(initialDocument = null) {
	const editorWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false,
			allowRunningInsecureContent: true,
			devTools: !isExam,
		},
	});

	let editorUrl = "app://edit/index.html";
	if (initialDocument) {
		const documentId = String(++nextDocumentId);
		windowDocuments.set(documentId, initialDocument);
		editorUrl += `?document=${encodeURIComponent(documentId)}`;
		editorWindow.on("closed", () => windowDocuments.delete(documentId));
	}

	editorWindow.loadURL(editorUrl);
	return editorWindow;
}

function readAlgoForgeFile(filePath) {
	if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
		throw new Error(`The file no longer exists: ${filePath}`);
	}
	if (fs.statSync(filePath).size > MAX_ALGOFORGE_FILE_SIZE) {
		throw new Error("AlgoForge files cannot be larger than 5 MB.");
	}

	return {
		initialAlgorithm: parseAlgoForgeFile(fs.readFileSync(filePath, "utf8")),
		title: path.basename(filePath, path.extname(filePath)),
	};
}

function showFileOpenError(filePath, error) {
	const message = error instanceof Error ? error.message : String(error);
	dialog.showErrorBox(`Unable to open ${path.basename(filePath)}`, message);
}

function openAlgoForgeFile(filePath) {
	if (!app.isReady()) {
		queuedFilePaths.add(filePath);
		return false;
	}

	try {
		createEditorWindow(readAlgoForgeFile(filePath));
		return true;
	} catch (error) {
		showFileOpenError(filePath, error);
		return false;
	}
}

function openFileArguments(args, workingDirectory) {
	const filePaths = findAlgoForgeFileArguments(args, workingDirectory);
	for (const filePath of filePaths) openAlgoForgeFile(filePath);
	return filePaths.length > 0;
}

const squirrelEvent = process.platform === "win32" ? process.argv[1] : null;
if (
	squirrelEvent === "--squirrel-install" ||
	squirrelEvent === "--squirrel-updated"
) {
	registerWindowsFileAssociation(process.execPath);
} else if (squirrelEvent === "--squirrel-uninstall") {
	unregisterWindowsFileAssociation(process.execPath);
}

const shouldRun = !squirrelStartup && app.requestSingleInstanceLock();
if (!shouldRun) app.quit();

if (shouldRun) initializeApplication();

function initializeApplication() {
	openFileArguments(process.argv.slice(1), process.cwd());

	app.on("open-file", (event, filePath) => {
		event.preventDefault();
		openAlgoForgeFile(path.resolve(filePath));
	});

	app.on("second-instance", (_event, argv, workingDirectory) => {
		if (!openFileArguments(argv, workingDirectory)) {
			const existingWindow = BrowserWindow.getAllWindows()[0];
			if (existingWindow?.isMinimized()) existingWindow.restore();
			existingWindow?.focus();
		}
	});

	app.on("ready", handleReady);

	app.on("window-all-closed", () => {
		if (process.platform !== "darwin") {
			app.quit();
		}
	});

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createEditorWindow();
		}
	});
}

function handleReady() {
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
				const fakeReq = {
					query: Object.fromEntries(url.searchParams),
				};
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
			const cheminIcone = path.join(libraryPath, url.pathname);

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
			const filePath = path.join(staticPath, "index.html");
			let fileContent = fs.readFileSync(filePath, "utf8");
			const documentId = url.searchParams.get("document");
			const launchDocument = documentId
				? windowDocuments.get(documentId)
				: null;
			const config = {
				initialAlgorithm: launchDocument?.initialAlgorithm ?? null,
				title: launchDocument?.title ?? null,
				hostKind: "electron",
				isExam,
				prettifyInitialAlgorithm: false,
			};

			if (request.method === "POST") {
				try {
					const formData = await request.formData();
					const corpAlgo = formData.get("corpAlgo");
					const nomFichier = formData.get("nomFichier");
					const sourceImport = formData.get("sourceImport");

					if (typeof corpAlgo === "string" && corpAlgo.length > 0) {
						config.initialAlgorithm = JSON.parse(corpAlgo);
						if (typeof config.initialAlgorithm === "string") {
							config.initialAlgorithm = JSON.parse(
								config.initialAlgorithm,
							);
						}
					}
					config.prettifyInitialAlgorithm = sourceImport === "tbr";
					if (
						typeof nomFichier === "string" &&
						nomFichier.length > 0
					) {
						config.title = nomFichier;
					}
				} catch (error) {
					console.error("Failed to parse posted editor data", error);
					return new Response("Invalid algorithm JSON.", {
						status: 400,
					});
				}
			}

			const serialized = JSON.stringify(config).replaceAll(
				"<",
				"\\u003c",
			);
			const marker =
				/(<script type="application\/json" id="algoforge-runtime-config">)[\s\S]*?(<\/script>)/;
			if (!marker.test(fileContent)) {
				return new Response(
					"Editor runtime configuration marker is missing.",
					{
						status: 500,
					},
				);
			}
			fileContent = fileContent.replace(marker, `$1${serialized}$2`);

			return new Response(fileContent, {
				headers: { "Content-Type": "text/html" },
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

	if (process.platform === "win32" && app.isPackaged) {
		registerWindowsFileAssociation(process.execPath);
	}

	let openedDocument = false;
	for (const filePath of queuedFilePaths) {
		openedDocument = openAlgoForgeFile(filePath) || openedDocument;
	}
	queuedFilePaths.clear();
	if (!openedDocument) createEditorWindow();
}
