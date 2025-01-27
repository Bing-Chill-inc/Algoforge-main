import { Router, Request, Response, response } from "express";
import expressAsyncHandler from "express-async-handler";
import { UsersService } from "./users.service";
import { Logger } from "../../utils/logger";
import { UserRegisterDTO, UserLoginDTO, UserUpdateDTO } from "./users.dto";
import { AuthService } from "../auth/auth.service";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { authMiddleware } from "../../middlewares/auth.middleware";

/**
 * Contrôleur pour les utilisateurs.
 * Routes disponibles :
 * - POST /register -> Inscription d'un utilisateur.
 * - GET /confirm/:token -> Confirmation de l'inscription.
 * - POST /login -> Connexion d'un utilisateur.
 * - GET /logout -> Déconnexion d'un utilisateur.
 * - POST /recover -> Récupération du mot de passe.
 * - GET /:id -> Récupérer un utilisateur.
 * - PUT /:id -> Mettre à jour un utilisateur.
 * - DELETE /:id -> Supprimer un utilisateur.
 * @hideconstructor
 * @category Controllers
 * @category Utilisateurs
 */
export class UsersController {
	public router: Router;
	private usersService: UsersService;
	private authService: AuthService;

	constructor() {
		Logger.debug("Initializing...", "UsersController");
		this.router = Router();
		this.usersService = new UsersService();
		this.authService = new AuthService();
		this.init();
		Logger.debug("Done !", "UsersController");
	}

	private init() {
		this.router.post(
			"/register",
			expressAsyncHandler(this.register.bind(this)),
		);
		this.router.get(
			"/confirm/:token",
			expressAsyncHandler(this.confirm.bind(this)),
		);
		this.router.post("/login", expressAsyncHandler(this.login.bind(this)));
		this.router.get("/logout", expressAsyncHandler(this.logout.bind(this)));
		this.router.post(
			"/recover",
			expressAsyncHandler(this.recover.bind(this)),
		);

		this.router.get(
			"/:id",
			authMiddleware,
			expressAsyncHandler(this.getUser.bind(this)),
		);

		this.router.put(
			"/:id",
			authMiddleware,
			expressAsyncHandler(this.updateUser.bind(this)),
		);

		this.router.delete(
			"/:id",
			authMiddleware,
			expressAsyncHandler(this.deleteUser.bind(this)),
		);
	}

	/**
	 * POST /register
	 * Inscription d'un utilisateur.
	 * @param req.body {@link UserRegisterDTO}
	 * @example
	 * // Retours possibles :
	 * {status: 400, message: "Il manque des données" }
	 * {status: 400, message: "Données invalides", data: {email: "Email invalide"} }
	 * {status: 409, message: "Email déjà utilisé" }
	 * {status: 500, message: "Erreur lors de la création de l'utilisateur" }
	 * {status: 500, message: "Erreur lors de la création du token de confirmation" }
	 * {status: 201, message: "Utilisateur créé", data: new Utilisateur() }
	 */
	private async register(req: Request, res: Response) {
		// Récupération des données de la requête
		const { email, password, pseudo } = req.body;

		const data = new UserRegisterDTO();
		data.pseudo = pseudo;
		data.email = email;
		data.password = password;

		const reponse = await this.usersService.register(data);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	/**
	 * GET /confirm/:token
	 * Confirmation de l'inscription.
	 * @param req.params.token Token de confirmation
	 * @example
	 * // Retours possibles :
	 * {status: 400, message: "Token manquant" }
	 * {status: 404, message: "Utilisateur introuvable ou déjà vérifié" }
	 * {status: 500, message: "Erreur lors de la confirmation de l'utilisateur" }
	 * {status: 200, message: "Inscription confirmé" }
	 */
	private async confirm(req: Request, res: Response) {
		// Récupération des données de la requête
		const token = req.params.token;
		if (!token) return res.status(400).json({ message: "Token manquant" });

		const reponse = await this.usersService.confirm(token);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	/**
	 * POST /login
	 * Connexion d'un utilisateur.
	 * @param req.body {@link UserLoginDTO}
	 * @example
	 * // Retours possibles :
	 * {status: 400, message: "Il manque des données" }
	 * {status: 400, message: "Données invalides", data: {email: "Email invalide"} }
	 * {status: 404, message: "Utilisateur introuvable" }
	 * {status: 401, message: "Mot de passe incorrect" }
	 * {status: 500, message: "Erreur lors de la connexion de l'utilisateur" }
	 * {status: 200, message: "Connexion réussie", data: new Utilisateur() }
	 */
	private async login(req: Request, res: Response) {
		// Récupération des données de la requête
		const { email, password } = req.body;

		const data = new UserLoginDTO();
		data.email = email;
		data.password = password;

		const reponse = await this.usersService.login(data);
		if (reponse.statut === 200 && reponse.data?.tokens[0]?.token) {
			// Ajout du token dans les headers de la réponse.
			res.header("Authorization", reponse.data?.tokens[0]?.token);
		}

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	/**
	 * GET /logout
	 * Déconnexion d'un utilisateur.
	 * @remarks
	 * Besoin d'être connecté, voir: {@link UsersService.verify}
	 * @example
	 * // Retours possibles :
	 * {status: 400, message: "Token manquant" }
	 * {status: 404, message: "Token introuvable" }
	 * {status: 200, message: "Déconnexion réussie" }
	 */
	private async logout(req: Request, res: Response) {
		// Récupération des données de la requête
		const token = this.authService.extractToken(req);
		if (!token) return res.status(400).json({ message: "Token manquant" });

		const reponse = await this.usersService.logout(token);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	/**
	 * TODO: POST /recover
	 * Récupération du mot de passe.
	 * @param req.body {email: string}
	 * @example
	 * // Retours possibles :
	 * {status: 200, message: "Mail de récupérataion envoyé" }
	 */
	private async recover(req: Request, res: Response) {
		// Récupération des données de la requête
		const { email } = req.body;

		const reponse = await this.usersService.recover(email);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	/**
	 * GET /:id
	 * Récupérer un utilisateur.
	 * @param req.params.id Id de l'utilisateur
	 * @remarks
	 * Besoin d'être connecté, voir: {@link UsersService.verify}
	 * @example
	 * // Retours possibles :
	 * {status: 404, message: "Utilisateur introuvable" }
	 * {status: 200, message: "Utilisateur trouvé", data: new Utilisateur() }
	 */
	private async getUser(req: Request, res: Response) {
		// Récupération de l'id de l'utilisateur
		const id = +req.params.id;

		// S'il a les droits, on récupère l'utilisateur
		const reponse = await this.usersService.getUser(id);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	/**
	 * PUT /:id
	 * Mettre à jour un utilisateur.
	 * @param req.params.id Id de l'utilisateur
	 * @param req.body {@link UserUpdateDTO}
	 * @remarks
	 * Besoin d'être connecté, voir: {@link UsersService.verify}
	 * @example
	 * // Retours possibles :
	 * {status: 403, message: "Permission refusée" }
	 * {status: 400, message: "Il manque des données" }
	 * {status: 400, message: "Données invalides", data: {email: "Email invalide"} }
	 * {status: 404, message: "Utilisateur introuvable" }
	 * {status: 401, message: "Mot de passe incorrect" }
	 * {status: 500, message: "Erreur lors de la mise à jour de l'utilisateur" }
	 * {status: 200, message: "Utilisateur mis à jour", data: new Utilisateur() }
	 */
	private async updateUser(req: Request, res: Response) {
		// Récupération de l'id de l'utilisateur
		const id = +req.params.id;

		// Récupération des données de la requête
		const { pseudo, currentPassword, newPassword } = req.body;

		const data = new UserUpdateDTO();
		data.pseudo = pseudo;
		data.currentPassword = currentPassword;
		data.newPassword = newPassword;
		data.requestedUserId = (res.locals.user as Utilisateur).id;

		const reponse = await this.usersService.updateUser(id, data);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	/**
	 * DELETE /:id
	 * Supprimer un utilisateur ainsi que toutes ses données.
	 * @param req.params.id Id de l'utilisateur
	 * @remarks
	 * Besoin d'être connecté, voir: {@link UsersService.verify}
	 * @example
	 * // Retours possibles :
	 * {status: 403, message: "Permission refusée" }
	 * {status: 404, message: "Utilisateur introuvable" }
	 * {status: 200, message: "Utilisateur supprimé" }
	 */
	private async deleteUser(req: Request, res: Response) {
		// Récupération de l'id de l'utilisateur
		const id = +req.params.id;
		const requestedUserId = (res.locals.user as Utilisateur).id;

		// S'il a les droits, on supprime l'utilisateur
		const reponse = await this.usersService.deleteUser(id, requestedUserId);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}
}
