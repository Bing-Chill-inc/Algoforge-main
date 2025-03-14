import * as nodemailer from "nodemailer";
import * as nodemailermock from "nodemailer-mock";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const TRANSPORTER_CONFIG: SMTPTransport.Options = {
	host: process.env.MAIL_HOST,
	port: Number(process.env.MAIL_PORT),
	secure: true, // true pour le port 465, false pour autres
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	},
	connectionTimeout: 30000,
	dnsTimeout: 30000,
	greetingTimeout: 30000,
	debug: true,
};

/**
 * Mock de nodemailer pour les tests.
 * @category Mail
 * @example
 * import { mocked } from "./transporter";
 *
 * // Test du bon envoi de l'email.
 * const mails = mocked.mock.getSentMail();
 * expect(mails).toHaveLength(1);
 * expect(mails[0].from).toBe(process.env.MAIL_USER);
 * expect(mails[0].to).toBe("test@algoforge.fr");
 * expect(mails[0].subject).toBe("Confirmation mail");
 * ...
 *
 * // Si vous réalisez plusieurs tests, il faut vider le mock avant chaque test.
 * afterAll(() => {
 *		mocked.mock.reset();
 * })
 */
export const mocked = nodemailermock.getMockFor(nodemailer);

/**
 * API pour l'envoi d'emails.
 * @category Mail
 * @example
 * import { Transporter } from "./transporter";
 * Transporter.sendMail({
 * 		from: process.env.MAIL_USER,
 * 		to: "test@algoforge.fr",
 * 		subject: "Test mail",
 * 		text: "Hello world",
 * 		html: "<b>Hello world</b>",
 * });
 * @see https://nodemailer.com/about/ Pour la documentation de nodemailer.
 */
export const Transporter =
	process.env.BUILD !== "test"
		? nodemailer.createTransport(TRANSPORTER_CONFIG)
		: mocked.createTransport(TRANSPORTER_CONFIG);
