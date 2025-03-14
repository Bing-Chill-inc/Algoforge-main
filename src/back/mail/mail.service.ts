import Handlebars from "handlebars";
import { Transporter } from "./transporter";
import { readFileSync } from "fs";
import { Logger } from "../utils/logger";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";

const TEMPLATES_FOLDER = `${__dirname}/templates`;

export class MailService {
	constructor() {}

	async testMail(destination: string) {
		try {
			if (!destination) {
				throw new Error("No email provided.");
			}

			let file = readFileSync(`${TEMPLATES_FOLDER}/test.html`, "utf8");
			let template = Handlebars.compile(file);
			let html = template({ destination });

			Logger.debug("Sending mail...", "mail: service", 2);
			await Transporter.sendMail({
				from: process.env.MAIL_USER,
				to: destination,
				subject: "Test mail",
				html: html,
			});
			Logger.debug("Mail sent", "mail: service", 2);
		} catch (err) {
			Logger.error(`Error sending mail: \n${err.stack}`, "mail: service");
		}
	}

	/**
	 * Envoie un mail de confirmation de l'inscription de l'utilisateur.
	 * @param destination Email de destination.
	 * @param user Données de l'utilisateur.
	 * @param token Token de confirmation.
	 */
	async sendConfirmationMail(
		destination: string,
		user: Utilisateur,
		token: string,
	) {
		try {
			if (!destination) {
				throw new Error("No email provided.");
			}

			let file = readFileSync(
				`${TEMPLATES_FOLDER}/confirm-inscription.html`,
				"utf8",
			);
			let template = Handlebars.compile(file);
			let html = template({
				url: `${process.env.EDITOR_URL}/api/confirm/${token}`,
				user: user.pseudo,
			});

			Logger.debug("Sending mail...", "mail: service", 2);
			await Transporter.sendMail({
				from: process.env.MAIL_USER,
				to: destination,
				subject: "Confirmation mail",
				html: html,
			});
			Logger.debug("Mail sent", "mail: service", 2);
		} catch (err) {
			Logger.error(`Error sending mail: \n${err.stack}`, "mail: service");
			throw err;
		}
	}
}
