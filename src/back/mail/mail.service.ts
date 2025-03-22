import Handlebars from "handlebars";
import { Transporter } from "./transporter";
import { readFileSync } from "fs";
import { Logger } from "../utils/logger";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";

const TEMPLATES_FOLDER = `${__dirname}/templates`;

export class MailService {
	/**
	 * Indique si le service de mail est actif ou non.
	 */
	active: boolean;

	constructor() {
		this.active = MailService.shouldBeActive();
	}

	/**
	 * Détermine si le service de mail doit est actif ou non.
	 * @returns true si doit être actif, false sinon.
	 */
	static shouldBeActive(): boolean {
		if (process.env.BUILD === "test") {
			return true;
		} else if (process.env.MAIL_ACTIVE === "true") {
			return true;
		}
		return false;
	}

	/**
	 * Envoie un mail de confirmation de l'inscription de l'utilisateur.
	 * @param destination Email de destination.
	 * @param user Données de l'utilisateur.
	 * @param token Token de confirmation.
	 */
	// TODO: en cas d'échec, retenter l'envoi de mail.
	async sendConfirmationMail(
		destination: string,
		user: Utilisateur,
		token: string,
	) {
		if (!this.active) return;
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
				url: `${process.env.EDITOR_URL}/api/users/confirm/${token}`,
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
