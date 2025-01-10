import { UsersService } from "../api/users/users.service";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";
import { Buffer } from "buffer";

/**
 * Génère un token de confirmation de mail, à partir d'infos utilisateur.
 * @returns Token de confirmation de mail.
 * @category Utils
 */
export async function createMailToken(id: number) {
	let token = "";
	const service = new UsersService();

	// Récupération des infos utilisateur
	const userData = (await service.getUser(id)).data as Utilisateur;

	if (!userData) {
		return null;
	}

	// Génération du token

	// ID utilisateur
	token += id.toString();

	// Email (3 premiers caractères), en majuscules, avec chiffrement en fonction de l'id
	let email = userData.adresseMail.toUpperCase().substring(0, 3);

	for (let i = 0; i < 3; i++) {
		let charCode = email.charCodeAt(i) + (id % 26);
		if (charCode > 90) charCode -= 26;
		email =
			email.substring(0, i) +
			String.fromCharCode(charCode) +
			email.substring(i + 1);
	}

	token += "_" + email;

	// Date d'inscription
	token += userData.dateInscription.toString();
	token = Buffer.from(token).toString("base64");

	return token;
}
