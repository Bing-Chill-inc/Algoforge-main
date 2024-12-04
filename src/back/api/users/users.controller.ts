import { Router, Request, Response } from "express";
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
		this.router.post("/register", this.register.bind(this));
		this.router.post("/login", this.login.bind(this));
		this.router.post("/verify", this.verify.bind(this));
		this.router.post("/logout", this.logout.bind(this));
		this.router.post("/recover", this.recover.bind(this));

		this.router.get(":id", this.getUser.bind(this));

		this.router.put(":id", this.updateUser.bind(this));

		this.router.delete(":id", this.deleteUser.bind(this));
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

	// POST /verify
	private async verify(req: Request, res: Response) {
		// Récupération des données de la requête
		const { token } = req.body;

		const reponse = await this.service.verify(token);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// POST /logout
	private async logout(req: Request, res: Response) {
		// Récupération des données de la requête
		const { token } = req.body;

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
		const id = req.params.id;

		const reponse = await this.service.getUser(+id);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// PUT /:id
	private async updateUser(req: Request, res: Response) {
		// Récupération de l'id de l'utilisateur
		const id = req.params.id;

		// Récupération des données de la requête
		const { pseudo, email, currentPassword, newPassword } = req.body;

		const data = new UserUpdateDTO();
		data.pseudo = pseudo;
		data.email = email;
		data.currentPassword = currentPassword;
		data.newPassword = newPassword;

		const reponse = await this.service.updateUser(+id, data);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}

	// DELETE /:id
	private async deleteUser(req: Request, res: Response) {
		// Récupération de l'id de l'utilisateur
		const id = req.params.id;

		const reponse = await this.service.deleteUser(+id);

		return res
			.status(reponse.statut)
			.json({ message: reponse.message, data: reponse.data });
	}
}
