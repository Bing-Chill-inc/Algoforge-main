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
import { getOwnerOfDir } from "../../utils/queries";
import { authMiddleware } from "../../middlewares/auth.middleware";

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
	private algosService: AlgosService;

	constructor() {
		Logger.debug("Initializing...", "AlgosController");
		this.router = Router();
		this.algosService = new AlgosService();
		this.init();
		Logger.debug("Done !", "AlgosController");
	}

	private init() {
		// Vérification des droits de l'utilisateur sur toutes les routes.
		this.router.use(authMiddleware);

		this.router.get(
			"/byUserId/:id",
			expressAsyncHandler(this.getAlgosPermsOfUser.bind(this)),
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
	// Si dirId est null, on se situe à la racine, sinon on se situe dans un dossier
	private async getAlgosPermsOfUser(req: Request, res: Response) {
		let { id, dirId } = req.params;

		// Si dirId est null, on se situe à la racine, sinon on se situe dans un dossier, on récupère l'owner du dossier
		if (dirId) {
			// Récupérer l'owner du dossier
			id = String((await getOwnerOfDir(+dirId)).id);

			if (!id) {
				return res.status(404).json(new Res(404, "Dossier non trouvé"));
			}
		}

		// Récupération des permissions des algorithmes de l'utilisateur dans le dossier
		const algosPerms = await this.algosService.getAlgosPermsOfUser(
			+id,
			+dirId,
		);

		if (!algosPerms || algosPerms.length === 0) {
			return res
				.status(404)
				.json(new NotFoundRes("Aucun algorithme trouvé"));
		}

		return res
			.status(200)
			.json(new OkRes("Algorithmes trouvés", algosPerms));
	}

	// GET /:id
	private async getAlgo(req: Request, res: Response) {
		// Récupération des données de la requête
		const { id } = req.params;
		const user = res.locals.user as Utilisateur;

		const algo = await this.algosService.getAlgo(+id, user.id);

		if (!algo) {
			return res
				.status(404)
				.json(new NotFoundRes("Algorithme non trouvé"));
		}

		return res.status(200).json(new OkRes("Algorithme trouvé", algo));
	}

	// POST / // TODO: dossier
	private async createAlgo(req: Request, res: Response) {
		// Récupération des données de la requête
		const { ownerId, nom, sourceCode } = req.body;
		if (!ownerId || !nom || !sourceCode) {
			return res
				.status(400)
				.json(new BadRequestRes("Données manquantes"));
		}

		const data = new AlgoCreateDTO();
		data.nom = nom;
		data.ownerId = ownerId;
		data.sourceCode = sourceCode;
		data.requestedUserId = (res.locals.user as Utilisateur).id;

		const result = await this.algosService.createAlgo(data);
		if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res.status(201).json(new CreatedRes("Algorithme créé", result));
	}

	// PUT /:id // TODO: dossier
	private async updateAlgo(req: Request, res: Response) {
		// Récupération des données de la requête
		const { id } = req.params;
		const { nom, permsAlgorithme, sourceCode } = req.body;
		if (!id || !nom || !permsAlgorithme || !sourceCode) {
			return res
				.status(BadRequestRes.statut)
				.json(new BadRequestRes("Données manquantes"));
		}

		const data = new AlgoUpdateDTO();
		data.id = +id;
		data.nom = nom;
		data.sourceCode = sourceCode;
		data.requestedUserId = (res.locals.user as Utilisateur).id;
		if (Array.isArray(permsAlgorithme) && permsAlgorithme?.length > 0) {
			data.permsAlgorithme = permsAlgorithme;
		}

		const updatedAlgo = await this.algosService.updateAlgo(data);

		if (!updatedAlgo) {
			return res
				.status(404)
				.json(new NotFoundRes("Algorithme non trouvé"));
		}

		return res
			.status(OkRes.statut)
			.json(new OkRes("Algorithme mis à jour", updatedAlgo));
	}

	// DELETE /:id
	private async deleteAlgo(req: Request, res: Response) {
		// Récupération des données de la requête
		const { id } = req.params;

		const result = await this.algosService.deleteAlgo(
			+id,
			res.locals.user.id,
		);

		if (!result) {
			return res
				.status(NotFoundRes.statut)
				.json(new NotFoundRes("Algorithme non trouvé"));
		} else if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res
			.status(OkRes.statut)
			.json(new OkRes("Algorithme supprimé", result));
	}
}
