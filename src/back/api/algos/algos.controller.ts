import { Router, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AlgosService } from "./algos.service";
import { Logger } from "../../utils/logger";
import { AlgoCreateDTO, AlgoUpdateDTO } from "./algos.dto";
import {
	BadRequestRes,
	CreatedRes,
	NotFoundRes,
	OkRes,
	Res,
} from "../../types/response.entity";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { Responses } from "../../constants/responses.const";

/**
 * Contrôleur pour les algorithmes.
 * Routes disponibles :
 * - GET /byUserId/:id -> Récupérer les algorithmes d'un utilisateur.
 * - GET /:id -> Récupérer un algorithme.
 * - POST / -> Créer un algorithme.
 * - PUT /:id -> Mettre à jour un algorithme.
 * - DELETE /:id -> Supprimer un algorithme.
 * @hideconstructor
 * @category Controllers
 * @category Algorithmes
 */
export class AlgosController {
	public router: Router;
	private usersService: AlgosService;

	constructor() {
		Logger.debug("Initializing...", "AlgosController");
		this.router = Router();
		this.usersService = new AlgosService();
		this.init();
		Logger.debug("Done !", "AlgosController");
	}

	private init() {
		// Vérification des droits de l'utilisateur sur toutes les routes.
		this.router.use(authMiddleware);

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
		// Récupération des données de la requête
		const { id } = req.params;

		const algos = await this.usersService.getAlgosOfUser(+id);

		if (!algos || algos.length === 0) {
			return res
				.status(NotFoundRes.statut)
				.json(new NotFoundRes(Responses.Algo.By_User.Not_found));
		}

		return res
			.status(OkRes.statut)
			.json(new OkRes(Responses.Algo.By_User.Found, algos));
	}

	// GET /:id
	private async getAlgo(req: Request, res: Response) {
		// Récupération des données de la requête
		const { id } = req.params;
		const user = res.locals.user as Utilisateur;

		const algo = await this.usersService.getAlgo(+id, user.id);

		if (!algo) {
			return res
				.status(NotFoundRes.statut)
				.json(new NotFoundRes(Responses.Algo.Not_found));
		}

		return res
			.status(OkRes.statut)
			.json(new OkRes(Responses.Algo.Success.Found, algo));
	}

	// POST /
	private async createAlgo(req: Request, res: Response) {
		// Récupération des données de la requête
		const { ownerId, nom, sourceCode } = req.body;
		if (!ownerId || !nom || !sourceCode) {
			return res
				.status(BadRequestRes.statut)
				.json(new BadRequestRes(Responses.General.Missing_data));
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

		return res
			.status(CreatedRes.statut)
			.json(new CreatedRes(Responses.Algo.Success.Created, result));
	}

	// PUT /:id
	private async updateAlgo(req: Request, res: Response) {
		// Récupération des données de la requête
		const { id } = req.params;
		const { nom, permsAlgorithme, sourceCode } = req.body;
		if (!id || !nom || !permsAlgorithme || !sourceCode) {
			return res
				.status(BadRequestRes.statut)
				.json(new BadRequestRes(Responses.General.Missing_data));
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
			return res
				.status(404)
				.json(new NotFoundRes(Responses.Algo.Not_found));
		}

		if (updatedAlgo instanceof Res) {
			return res.status(updatedAlgo.statut).json(updatedAlgo);
		}

		return res
			.status(OkRes.statut)
			.json(new OkRes(Responses.Algo.Success.Updated, updatedAlgo));
	}

	// DELETE /:id
	private async deleteAlgo(req: Request, res: Response) {
		// Récupération des données de la requête
		const { id } = req.params;

		const result = await this.usersService.deleteAlgo(
			+id,
			res.locals.user.id,
		);

		if (!result) {
			return res
				.status(NotFoundRes.statut)
				.json(new NotFoundRes(Responses.Algo.Not_found));
		} else if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res
			.status(OkRes.statut)
			.json(new OkRes(Responses.Algo.Success.Deleted, result));
	}
}
