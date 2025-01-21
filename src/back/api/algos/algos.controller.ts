import { Router, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AlgosService } from "./algos.service";
import { Logger } from "../../utils/logger";
import { AlgoCreateDTO, AlgoUpdateDTO } from "./algos.dto";
import { Res } from "../../types/response.entity";
import { AuthService } from "../auth/auth.service";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { PermAlgorithme } from "../../db/schemas/PermAlgorithme.schema";
import { getOwnerOfDir } from "../../utils/queries";

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
	private authService: AuthService;

	constructor() {
		Logger.debug("Initializing...", "AlgosController");
		this.router = Router();
		this.algosService = new AlgosService();
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
	// Si dirId est null, on se situe à la racine, sinon on se situe dans un dossier
	private async getAlgosOfUser(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération des données de la requête
		const { id, dirId } = req.params;

		// Récupération des algorithmes de l'utilisateur en fonction du dossier
		let algos: PermAlgorithme[];

		if (!dirId) {
			// On se situe à la racine
			algos = await this.algosService.getAlgosOfUser(+id);
		} else {
			// On se situe dans un dossier
			// Récupérer l'owner du dossier
			const dirOwner = await getOwnerOfDir(+dirId);

			if (!dirOwner) {
				return res.status(404).json(new Res(404, "Dossier non trouvé"));
			}
	
			algos = await this.algosService.getAlgosOfUserInDir(dirOwner.id, +dirId);
		}

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
		const user = res.locals.user as Utilisateur;

		const algo = await this.algosService.getAlgo(+id, user.id);

		if (!algo) {
			return res.status(404).json(new Res(404, "Algorithme non trouvé"));
		}

		return res.status(200).json(new Res(200, "Algorithme trouvé", algo));
	}

	// POST / // TODO: dossier
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

		const result = await this.algosService.createAlgo(data);
		if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res.status(201).json(new Res(201, "Algorithme créé", result));
	}

	// PUT /:id // TODO: dossier
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

		const updatedAlgo = await this.algosService.updateAlgo(data);

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

		const result = await this.algosService.deleteAlgo(
			+id,
			res.locals.user.id,
		);

		if (!result) {
			return res.status(404).json(new Res(404, "Algorithme non trouvé"));
		} else if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res
			.status(200)
			.json(new Res(200, "Algorithme supprimé", result));
	}
}
