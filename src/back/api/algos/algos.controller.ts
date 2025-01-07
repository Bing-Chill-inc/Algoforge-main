import { Router, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AlgosService } from "./algos.service";
import { Logger } from "../../utils/logger";
import { AlgoCreateDTO, AlgoUpdateDTO } from "./algos.dto";
import { Res } from "../../types/response.entity";
import { AuthService } from "../auth/auth.service";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";

export class AlgosController {
	public router: Router;
	private usersService: AlgosService;
	private authService: AuthService;

	constructor() {
		Logger.debug("Initializing...", "AlgosController");
		this.router = Router();
		this.usersService = new AlgosService();
		this.authService = new AuthService();
		this.init();
		Logger.debug("Done !", "AlgosController");
	}

	private init() {
		this.router.get(
			"/byUserId/:id",
			expressAsyncHandler(this.getAlgosOfUser.bind(this)),
		);
		this.router.get("/:id", expressAsyncHandler(this.getAlgo.bind(this)));

		this.router.post("/", expressAsyncHandler(this.createAlgo.bind(this)));
		this.router.put(
			"/:id",
			expressAsyncHandler(this.updateAlgo.bind(this)),
		);

		this.router.delete(
			"/:id",
			expressAsyncHandler(this.deleteAlgo.bind(this)),
		);
	}

	// GET /byUserId/:id
	private async getAlgosOfUser(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération des données de la requête
		const { id } = req.params;

		const algos = await this.usersService.getAlgosOfUser(+id);

		if (!algos || algos.length === 0) {
			return res
				.status(404)
				.json(new Res(404, "Aucun algorithme trouvé"));
		}

		return res.status(200).json(new Res(200, "Algorithmes trouvés", algos));
	}

	// GET /:id
	private async getAlgo(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération des données de la requête
		const { id } = req.params;

		const algo = await this.usersService.getAlgo(+id);

		if (!algo) {
			return res.status(404).json(new Res(404, "Algorithme non trouvé"));
		}

		return res.status(200).json(new Res(200, "Algorithme trouvé", algo));
	}

	// POST /
	private async createAlgo(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération des données de la requête
		const { ownerId, nom, sourceCode } = req.body;
		if (!ownerId || !nom || !sourceCode) {
			return res.status(400).json(new Res(400, "Données manquantes"));
		}

		const data = new AlgoCreateDTO();
		data.nom = nom;
		data.ownerId = ownerId;
		data.sourceCode = sourceCode;
		data.requestedUserId = (res.locals.user as Utilisateur).id;

		const result = await this.usersService.createAlgo(data);
		if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res.status(201).json(new Res(201, "Algorithme créé", result));
	}

	// PUT /:id
	private async updateAlgo(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération des données de la requête
		const { id } = req.params;
		const { nom, permsAlgorithme, sourceCode } = req.body;
		if (!id || !nom || !permsAlgorithme || !sourceCode) {
			return res.status(400).json(new Res(400, "Données manquantes"));
		}

		const data = new AlgoUpdateDTO();
		data.id = +id;
		data.nom = nom;
		data.sourceCode = sourceCode;
		data.requestedUserId = (res.locals.user as Utilisateur).id;
		if (Array.isArray(permsAlgorithme) && permsAlgorithme?.length > 0) {
			data.permsAlgorithme = permsAlgorithme;
		}

		const updatedAlgo = await this.usersService.updateAlgo(data);

		if (!updatedAlgo) {
			return res.status(404).json(new Res(404, "Algorithme non trouvé"));
		}

		return res
			.status(200)
			.json(new Res(200, "Algorithme mis à jour", updatedAlgo));
	}

	// DELETE /:id
	private async deleteAlgo(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération des données de la requête
		const { id } = req.params;

		const algo = await this.usersService.deleteAlgo(+id);

		if (!algo) {
			return res.status(404).json(new Res(404, "Algorithme non trouvé"));
		}

		return res.status(200).json(new Res(200, "Algorithme supprimé", algo));
	}
}
