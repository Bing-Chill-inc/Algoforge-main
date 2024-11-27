import { Router, Request, Response } from "express";
import { AlgosService } from "./algos.service";
import { Logger } from "../../utils/logger";
import { AlgoCreateDTO, AlgoUpdateDTO } from "./algos.dto";

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
		this.router.get("/byUserId/:id", this.getAlgosOfUser.bind(this));
		this.router.get("/:id", this.getAlgo.bind(this));

		this.router.post("/", this.createAlgo.bind(this));
		this.router.put("/:id", this.updateAlgo.bind(this));

		this.router.delete("/:id", this.deleteAlgo.bind(this));
	}

	// GET /byUserId/:id
	private async getAlgosOfUser(req: Request, res: Response) {
		// Récupération des données de la requette.
		const { id } = req.params;
		const algos = await this.service.getAlgosOfUser(+id);

		if (!algos || algos.length === 0) {
			return res.status(404).json({ message: "Aucun algorithme trouvé" });
		}

		return res.status(200).json(algos);
	}

	// GET /:id
	private async getAlgo(req: Request, res: Response) {
		// Récupération des données de la requette.
		const { id } = req.params;
		const algo = await this.service.getAlgo(+id);
		if (!algo) {
			return res.status(404).json({ message: "Algorithme non trouvé" });
		}

		return res.status(200).json(algo);
	}

	// POST /
	private async createAlgo(req: Request, res: Response) {
		// Récupération des données de la requette.
		const { idUtilisateur, nom, sourceCode } = req.body;
		const data = new AlgoCreateDTO();
		data.nom = nom;
		data.ownerId = idUtilisateur;
		data.sourceCode = sourceCode;

		const result = await this.service.createAlgo(data);
		return res.status(201).json(result);
	}

	// PUT /:id
	private async updateAlgo(req: Request, res: Response) {
		// Récupération des données de la requette.
		const { id } = req.params;
		const {
			nom,
			dateCreation,
			dateModification,
			permsAlgorithme,
			sourceCode,
		} = req.body;
		const data = new AlgoUpdateDTO();
		data.id = +id;
		data.nom = nom;
		data.dateCreation = dateCreation;
		data.dateModification = dateModification;
		data.permsAlgorithme = permsAlgorithme;
		data.sourceCode = sourceCode;

		const updatedAlgo = await this.service.updateAlgo(data);
		if (!updatedAlgo) {
			return res.status(404).json({ message: "Algorithme non trouvé" });
		}
		return res.status(200).json(updatedAlgo);
	}

	// DELETE /:id
	private async deleteAlgo(req: Request, res: Response) {
		// Récupération des données de la requette.
		const { id } = req.params;

		const algo = await this.service.deleteAlgo(+id);
		if (!algo) {
			return res.status(404).json({ message: "Algorithme non trouvé" });
		}

		return res.status(200).json(algo);
	}
}
