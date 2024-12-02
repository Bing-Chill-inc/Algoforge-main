import { createTransport } from "nodemailer";

export const Transporter = createTransport({
	host: process.env.MAIL_HOST,
	port: Number(process.env.MAIL_PORT),
	secure: true, // true pour le port 465, false pour autres
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	},
});
