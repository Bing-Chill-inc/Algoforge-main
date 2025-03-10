import { Request, Response } from "express";
import { UsersService } from "../users/users.service";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { Token } from "../../db/schemas/Token.schema";

/**
 * Service pour l'authentification de l'utilisateur.
 * @hideconstructor
 * @category Services
 */
export class AuthService {
	private usersService: UsersService;

	constructor() {
		this.usersService = new UsersService();
	}

	/**
	 * Vérification des droits de l'utilisateur sur une ressource.
	 * La requête req peut être modifié par la fonction pour ajouter des informations.
	 * Elles sont accessibles avec req.locals.user.
	 * @param req Requête Express
	 * @param res Réponse Express
	 * @returns true si l'utilisateur a les droits, false sinon.
	 */
	public async verifyUser(req: Request, res: Response) {
		const verify = await this.usersService.verify(this.extractToken(req));
		if ([400, 401].includes(verify.statut)) {
			res.status(verify.statut).json(verify);
			return false;
		}

		// Ajout de l'utilisateur dans les informations de la requête.
		const token = verify.data as Token;
		const user = token.utilisateur as Utilisateur;
		res.locals.user = user;
		// Ajout du token dans les headers de la réponse.
		res.header("Authorization", token.token);

		return true;
	}

	public extractToken(req: Request) {
		return req.headers.authorization
			? req.headers.authorization.split(" ")[1]
			: "";
	}
}
