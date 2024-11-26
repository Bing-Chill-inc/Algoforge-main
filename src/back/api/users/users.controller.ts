import { Router } from "express";
import { UsersService } from "./users.service";

export class UsersController {
	public router: Router;
	private service: UsersService;

	constructor() {
		this.router = Router();
		this.service = new UsersService();
		this.init();
	}

	private init() {
		this.router.post("/register", this.service.register);
		this.router.post("/login", this.service.login);
		this.router.post("/verify", this.service.verify);
		this.router.post("/logout", this.service.logout);
		this.router.post("/recover", this.service.recover);

		this.router.get(":id", this.service.getUser);

		this.router.put(":id", this.service.updateUser);

		this.router.delete(":id", this.service.deleteUser);
	}
}
