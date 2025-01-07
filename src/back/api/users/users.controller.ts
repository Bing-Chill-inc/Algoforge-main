import { Router, Request, Response, response } from "express";
import expressAsyncHandler from "express-async-handler";
import { UsersService } from "./users.service";
import { Logger } from "../../utils/logger";
import { UserRegisterDTO, UserLoginDTO, UserUpdateDTO } from "./users.dto";
import { AuthService } from "../auth/auth.service";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";

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

		this.router.get("/:id", expressAsyncHandler(this.getUser.bind(this)));

		this.router.put(
			"/:id",
			expressAsyncHandler(this.updateUser.bind(this)),
		);

		this.router.delete(
			"/:id",
			expressAsyncHandler(this.deleteUser.bind(this)),
		);
	}

	// POST /register
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

	// GET /confirm/:token
	private async confirm(req: Request, res: Response) {
		// Récupération des données de la requête
		const token = req.params.token;
		if (!token) return res.status(400).json({ message: "Token manquant" });

		const reponse = await this.usersService.confirm(token);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// POST /login
	private async login(req: Request, res: Response) {
		// Récupération des données de la requête
		const { email, password } = req.body;

		const data = new UserLoginDTO();
		data.email = email;
		data.password = password;

		const reponse = await this.usersService.login(data);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// GET /logout
	private async logout(req: Request, res: Response) {
		// Récupération des données de la requête
		const token = this.authService.extractToken(req);

		const reponse = await this.usersService.logout(token);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// POST /recover
	private async recover(req: Request, res: Response) {
		// Récupération des données de la requête
		const { email } = req.body;

		const reponse = await this.usersService.recover(email);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// GET /:id
	private async getUser(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération de l'id de l'utilisateur
		const id = +req.params.id;

		// S'il a les droits, on récupère l'utilisateur
		const reponse = await this.usersService.getUser(id);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// PUT /:id
	private async updateUser(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération de l'id de l'utilisateur
		const id = +req.params.id;

		// Récupération des données de la requête
		const { pseudo, email, currentPassword, newPassword } = req.body;

		const data = new UserUpdateDTO();
		data.pseudo = pseudo;
		data.email = email;
		data.currentPassword = currentPassword;
		data.newPassword = newPassword;
		data.requestedUserId = (res.locals.user as Utilisateur).id;

		const reponse = await this.usersService.updateUser(id, data);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// DELETE /:id
	private async deleteUser(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération de l'id de l'utilisateur
		const id = +req.params.id;

		// S'il a les droits, on supprime l'utilisateur
		const reponse = await this.usersService.deleteUser(id);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}
}
