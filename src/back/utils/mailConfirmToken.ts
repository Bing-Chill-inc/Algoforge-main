import { UsersService } from "../api/users/users.service";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";

/** Génère un token de confirmation de mail, à partir d'infos utilisateur.
 *
 * @returns Token de confirmation de mail.
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
		email = String.fromCharCode(email.charCodeAt(i) + (id % 26));
	}

	token += "_" + email;

	// Date d'inscription (année)
	token += userData.dateInscription.getFullYear().toString();

	// Chiffrement en base64
	token = atob(token);

	return token;
}
