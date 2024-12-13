import { Router, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { UsersService } from "./users.service";
import { Logger } from "../../utils/logger";
import { UserRegisterDTO, UserLoginDTO, UserUpdateDTO } from "./users.dto";

export class UsersController {
	public router: Router;
	private service: UsersService;

	constructor() {
		Logger.debug("Initializing...", "UsersController");
		this.router = Router();
		this.service = new UsersService();
		this.init();
		Logger.debug("Done !", "UsersController");
	}

	private init() {
		this.router.post(
			"/register",
			expressAsyncHandler(this.register.bind(this)),
		);
		this.router.post(
			"/confirm/:token",
			expressAsyncHandler(this.confirm.bind(this)),
		);
		this.router.post("/login", expressAsyncHandler(this.login.bind(this)));
		this.router.get("/logout", expressAsyncHandler(this.logout.bind(this)));
		this.router.post(
			"/recover",
			expressAsyncHandler(this.recover.bind(this)),
		);

		this.router.get(":id", expressAsyncHandler(this.getUser.bind(this)));

		this.router.put(":id", expressAsyncHandler(this.updateUser.bind(this)));

		this.router.delete(
			":id",
			expressAsyncHandler(this.deleteUser.bind(this)),
		);
	}

	// Fonction privée pour vérifier l'utilisateur à partir de son token et de l'id
	private async verifyUser(req: Request, res: Response, id: number) {
		const verify = await this.service.verify(req.headers.authorization);

		if (verify.data.tokenDB.utilisateur.id !== id) {
			res.status(403).json({
				message:
					"Vous n'avez pas les droits pour effectuer cette action",
			});
			return false;
		}
		return true;
	}

	// POST /register
	private async register(req: Request, res: Response) {
		// Récupération des données de la requête
		const { email, password, pseudo } = req.body;

		const data = new UserRegisterDTO();
		data.pseudo = pseudo;
		data.email = email;
		data.password = password;

		const reponse = await this.service.register(data);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// GET /confirm/:token
	private async confirm(req: Request, res: Response) {
		// Récupération des données de la requête
		const token = req.params.token;

		const reponse = await this.service.confirm(token);

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

		const reponse = await this.service.login(data);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// GET /logout
	private async logout(req: Request, res: Response) {
		// Récupération des données de la requête
		const token = req.headers.authorization;

		const reponse = await this.service.logout(token);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// POST /recover
	private async recover(req: Request, res: Response) {
		// Récupération des données de la requête
		const { email } = req.body;

		const reponse = await this.service.recover(email);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// GET /:id
	private async getUser(req: Request, res: Response) {
		// Récupération de l'id de l'utilisateur
		const id = +req.params.id;

		// On vérifie que l'utilisateur qui fait la requête est bien celui qu'il veut récupérer
		if (!(await this.verifyUser(req, res, id))) return;

		// S'il a les droits, on récupère l'utilisateur
		const reponse = await this.service.getUser(id);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// PUT /:id
	private async updateUser(req: Request, res: Response) {
		// Récupération de l'id de l'utilisateur
		const id = +req.params.id;

		// On vérifie que l'utilisateur qui fait la requête est bien celui qu'il veut récupérer
		if (!(await this.verifyUser(req, res, id))) return;

		// S'il a les droits, on met à jour l'utilisateur

		// Récupération des données de la requête
		const { pseudo, email, currentPassword, newPassword } = req.body;

		const data = new UserUpdateDTO();
		data.pseudo = pseudo;
		data.email = email;
		data.currentPassword = currentPassword;
		data.newPassword = newPassword;

		const reponse = await this.service.updateUser(id, data);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// DELETE /:id
	private async deleteUser(req: Request, res: Response) {
		// Récupération de l'id de l'utilisateur
		const id = +req.params.id;

		// On vérifie que l'utilisateur qui fait la requête est bien celui qu'il veut récupérer
		if (!(await this.verifyUser(req, res, id))) return;

		// S'il a les droits, on supprime l'utilisateur
		const reponse = await this.service.deleteUser(id);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}
}
