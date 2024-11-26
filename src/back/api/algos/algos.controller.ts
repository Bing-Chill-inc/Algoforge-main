import { Router } from "express";
import { AlgosService } from "./algos.service";
import { Logger } from "../../utils/logger";

export class AlgosController {
	public router: Router;
	private service: AlgosService;

	constructor() {
		Logger.debug("Initializing...", "AlgosController");
		this.router = Router();
		this.service = new AlgosService();
		this.init();
		Logger.debug("Done !", "AlgosController");
	}

	private init() {
		this.router.get("/byUserId/:id", this.service.getAlgosOfUser);
		this.router.get("/:id", this.service.getAlgo);

		this.router.post("/", this.service.createAlgo);
		this.router.put("/:id", this.service.updateAlgo);

		this.router.delete("/:id", this.service.deleteAlgo);
	}
}
