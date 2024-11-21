import { app, BrowserWindow } from "electron";
import express from "express";
import path from "path";

// Helper to resolve paths based on environment
const isDev = !app.isPackaged; // Detect if running in development
const staticPath = isDev
	? path.join(path.resolve(), "../front-editeur/src") // Dev path
	: path.join(process.resourcesPath, "src"); // Production path

// Express app setup
const expressApp = express();

// Get an available port
const port = Math.floor(Math.random() * 1000) + 3000;

// Example dynamic route handlers (ensure these are imported correctly)
import AssetsDynamiques from "./assetsDynamiquesForElectron.js";
import getBibliothèque from "./getBibliothequesForElectron.js";
import { iconHandler } from "./getBibliothequesForElectron.js";

AssetsDynamiques.forEach((asset) => {
	expressApp.get(`/edit/assetsDynamiques${asset.route}`, asset.callback);
});

expressApp.get(getBibliothèque.route, getBibliothèque.callback);
expressApp.get(iconHandler.route, iconHandler.callback);

// Serve static files
expressApp.use("/edit", express.static(staticPath));

// Start the server
expressApp.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

// Electron main window
let mainWindow;

app.on("ready", () => {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	// Point to the web server URL
	mainWindow.loadURL(`http://localhost:${port}/edit`);
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
			},
		});

		mainWindow.loadURL(`http://localhost:${port}/edit`);
	}
});
