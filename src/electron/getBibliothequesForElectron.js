import fs from "fs";
import path from "path";
import { URL } from "url";
import { app } from "electron";

// Helper to resolve paths based on environment
const isDev = !app.isPackaged; // Detect if running in development
const basePath = isDev
	? path.join(path.resolve(), "../front-editeur/src") // Dev path
	: path.join(process.resourcesPath, "src"); // Production path

const lireContenuFichier = (chemin) => {
	return fs.existsSync(chemin) ? fs.readFileSync(chemin, "utf8") : "";
};

const explorerDossier = (dossier) => {
	const resultat = [];
	const sousDossiers = fs.readdirSync(dossier).filter((nom) => {
		const cheminComplet = path.join(dossier, nom);
		return fs.statSync(cheminComplet).isDirectory();
	});

	sousDossiers.forEach((nomDossier) => {
		const cheminDossier = path.join(dossier, nomDossier);
		const structureDossier = {
			nom: lireContenuFichier(path.join(cheminDossier, "nom.txt")),
			contenu: [],
		};

		const fichiers = fs.readdirSync(cheminDossier);
		fichiers.forEach((nomFichier) => {
			const cheminComplet = path.join(cheminDossier, nomFichier);
			if (fs.statSync(cheminComplet).isDirectory()) {
				const structureFichier = {
					nom: lireContenuFichier(path.join(cheminComplet, "nom.txt")) || nomFichier,
					descriptif: lireContenuFichier(path.join(cheminComplet, "descriptif.html")) || "",
					algo: lireContenuFichier(path.join(cheminComplet, "algo.json")) || "",
					path: cheminComplet.substring(dossier.length + 1),
				};
				structureDossier.contenu.push(structureFichier);
			}
		});

		resultat.push(structureDossier);
	});

	return resultat;
};

const routeHandler = {
	route: "/Bibliotheque/getStructure",
	callback: (req, res) => {
		// Use the dynamically resolved base path
		const cheminBibliotheque = path.join(basePath, "Bibliotheque");
		const arborescence = explorerDossier(cheminBibliotheque);

		res.setHeader("Content-Type", "application/json");
		res.send(JSON.stringify(arborescence, null, 2));
	},
};

const iconHandler = {
	route: "/edit/Bibliotheque/**/**/icone.svg",
	callback: (req, res) => {
		const cheminIcone = path.join(basePath, new URL(req.url, "http://localhost").pathname.replace("/edit", ""));

		console.log(cheminIcone);

		let fileContent = lireContenuFichier(cheminIcone);

		// Replace PHP-style placeholders with query parameters
		const regex = /<\?php echo \$_GET\[[^\]]+\] \?>/g;

		const matches = fileContent.match(regex);

		console.log(matches);
		console.log(req.query);

		if (matches) {
			matches.forEach((match) => {
				try {
					const variableRegex = /\$_GET\['([^\]]+)'\]/g;
					const variableObj = variableRegex.exec(match);
					console.log(variableObj);
					const variable = variableObj[1];
					const valeur = req.query[variable];
					console.log(variable, valeur);
					fileContent = fileContent.replace(match, valeur);
				} catch (e) {
					console.error(e);
				}
			});
		}

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(fileContent);
	},
};

export default routeHandler;

export { iconHandler };
