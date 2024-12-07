import dayjs from "dayjs";
import clic from "cli-color";
import readline from "readline";
import fs from "fs";

function initLogFile(logsFolderPath: string) {
	if (!fs.existsSync(logsFolderPath)) {
		fs.mkdirSync(logsFolderPath);
	}
	return `${logsFolderPath}${dayjs().format("YYYY-MM-DD")}.log`;
}

function parsingConsole(
	message: string,
	color = clic.white,
	style: string,
	exec = "",
) {
	const now = dayjs().format("HH:mm:ss");
	exec = !exec ? " " : ` [${clic.magentaBright(exec)}] `;
	return `${clic.blueBright("[" + now + "]")} ${style}${exec}${color(
		message,
	)}`;
}

function parsingFile(message: string, style: string, exec = "") {
	const now = dayjs().format("HH:mm:ss");
	exec = !exec ? " " : ` [${exec}] `;
	return `[${now}] ${style}${exec}${message}\n`;
}

function writeLog(message: string, style: string, exec = "", file: string) {
	const log = parsingFile(message, style, exec);
	fs.appendFileSync(initLogFile(file), log);
}

/**
 * Logger permet de journaliser des messages, avertissements, erreurs et debugs.
 * Les logs sont affichés à l'écran et enregistrés dans un fichier log.
 * Le dosiser logs/ sera automatique créé s'il n'existe pas, au chemin filePath.
 * Elle est à utiliser en priorité, au lieu des console.log()...
 * La classe n'a pas besoin d'être instanciée, car ses méthodes sont statiques.
 */
export class Logger {
	static filePath: string = `${process.cwd()}/logs/`;

	constructor() {
		throw new Error("Classe non instanciable.");
	}

	/**
	 * Journalise le message en paramètre.
	 * @param {string} message Log à enregistrer. Sera ensuite afficher à l'écran et enregistrer dans un fichier log.
	 * @param {string} exec Chemin indiquant d'où provient ce log.
	 * @param {clic.Format} color Couleur du message.
	 */
	static log(
		message: string,
		exec: string = "",
		color: clic.Format = clic.white,
	): void {
		readline.cursorTo(process.stdout, 0);
		readline.clearLine(process.stdout, -1);
		console.log(parsingConsole(message, color, "ℹ️", exec));
		writeLog(message, "INFO", exec, this.filePath);
	}

	/**
	 * Journalise l'avertissement en paramètre.
	 * @param {string} message Avertissement à enregistrer. Sera ensuite afficher à l'écran et enregistrer dans un fichier log.
	 * @param {string} exec Chemin indiquant d'où provient ce log.
	 */
	static warn(message: string, exec: string = ""): void {
		readline.cursorTo(process.stdout, 0);
		readline.clearLine(process.stdout, -1);
		console.warn(parsingConsole(message, clic.yellowBright, "⚠️", exec));
		writeLog(message, "WARN", exec, this.filePath);
	}

	/**
	 * Journalise l'erreur en paramètre.
	 * @param {string} message Erreur à enregistrer. Sera ensuite afficher à l'écran et enregistrer dans un fichier log.
	 * @param {string} exec Chemin indiquant d'où provient ce log.
	 */
	static error(message: string, exec: string = ""): void {
		readline.cursorTo(process.stdout, 0);
		readline.clearLine(process.stdout, -1);
		console.error(parsingConsole(message, clic.redBright, "❗", exec));
		writeLog(message, "ERROR", exec, this.filePath);
	}

	/**
	 * Journalise un message de debug avec un niveau.
	 * @param {string} message Message de debug à enregistrer. Sera ensuite afficher à l'écran et enregistrer dans un fichier log, seulement si le niveau level configuré dans le fichier .env est respecté.
	 * @param {string} exec Chemin indiquant d'où provient ce debug.
	 * @param {number} level Niveau de debug du message.
	 */
	static debug(message: string, exec: string, level: number = 1): void {
		if (process.env.DEBUG && Number(process.env.DEBUG_LEVEL) >= level) {
			readline.cursorTo(process.stdout, 0);
			readline.clearLine(process.stdout, -1);
			console.debug(parsingConsole(message, clic.white, "🔧", exec));
			writeLog(message, "DEBUG", exec, this.filePath);
		}
	}
}
