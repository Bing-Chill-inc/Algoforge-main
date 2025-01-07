import e, { Request, Response } from "express";
import { UsersService } from "../users/users.service";

export class AuthService {
	private usersService: UsersService;

	constructor() {
		this.usersService = new UsersService();
	}

	/**
	 * Vérification des droits de l'utilisateur sur une ressource.
	 * La requête req peut être modifié par la fonction pour ajouter des informations.
	 * @param req Requête Express
	 * @param res Réponse Express
	 * @returns true si l'utilisateur a les droits, false sinon.
	 */
	public async verifyUser(req: Request, res: Response) {
		const verify = await this.usersService.verify(this.extractToken(req));
		if (verify.statut === 401) {
			res.status(verify.statut).json(verify);
			return false;
		}

		/**
		 * Vérification des droits de l'utilisateur sur la ressource
		 * @deprecated
		 */
		// if (verify.data.tokenDB.utilisateur.id !== id) {
		// 	res.status(403).json({
		// 		message:
		// 			"Vous n'avez pas les droits pour effectuer cette action",
		// 	});
		// 	return false;
		// }
		res.locals.user = verify.data.tokenDB.utilisateur;
		return true;
	}

	public extractToken(req: Request) {
		return req.headers.authorization;
	}
}
