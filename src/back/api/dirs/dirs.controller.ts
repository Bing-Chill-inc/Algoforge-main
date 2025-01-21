import { Router, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { DirsService } from "./dirs.service";
import { Logger } from "../../utils/logger";
import { DirCreateDTO, DirUpdateDTO } from "./dirs.dto";
import { Res } from "../../types/response.entity";
import { AuthService } from "../auth/auth.service";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";

/**
 * Contrôleur pour les dossiers.
 * Routes disponibles :
 * - GET /byUserId/:id -> Récupérer les dossiers d'un utilisateur.
 * - POST / -> Créer un dossier.
 * - PUT /:id -> Mettre à jour un dossier.
 * - DELETE /:id -> Supprimer un dossier.
 * @hideconstructor
 * @category Controllers
 * @category Dossiers
 */
export class DirsController {
	public router: Router;
	private authService: AuthService;
	private dirsService: DirsService;

	constructor() {
		Logger.debug("Initializing...", "DirsController");
		this.router = Router();
		this.authService = new AuthService();
		this.dirsService = new DirsService();
		this.init();
		Logger.debug("Done !", "DirsController");
	}

	private init() {
		this.router.get(
			"/byUserId/:id",
			expressAsyncHandler(this.getDirs.bind(this)),
		);

		this.router.post("/", expressAsyncHandler(this.createDir.bind(this)));

		this.router.put("/:id", expressAsyncHandler(this.updateDir.bind(this)));

		this.router.delete(
			"/:id",
			expressAsyncHandler(this.deleteDir.bind(this)),
		);
	}

	// GET /
	private async getDirs(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupérations des données de la requête
		const { id } = req.params;

		const dirs = await this.dirsService.getDirsOfUser(+id);

		if (!dirs || dirs.length === 0) {
			return res.status(404).json(new Res(404, "Aucun dossier trouvé"));
		}

		return res.status(200).json(new Res(200, "Dossiers trouvés", dirs));
	}

	// POST /
	private async createDir(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération des données de la requête
		const { nom, ownerId, idParent } = req.body;
		if (!nom || !ownerId) {
			return res.status(400).json(new Res(400, "Données manquantes"));
		}

		console.log("idParent", idParent);

		const data = new DirCreateDTO();
		data.nom = nom;
		data.ownerId = ownerId;
		data.idParent = idParent; // TODO : vérifier si on a bien un null et pas un undefined
		data.requestedUserId = (res.locals as Utilisateur).id;

		const result = await this.dirsService.createDir(data);
		if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res.status(201).json(new Res(201, "Dossier créé", result));
	}

	// PUT /:id
	private async updateDir(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération des données de la requête
		const { id } = req.params;
		const { nom, permsDossier, idParent } = req.body;
		if (!id || !nom || !permsDossier) {
			return res.status(400).json(new Res(400, "Données manquantes"));
		}

		console.log("idParent", idParent);

		const data = new DirUpdateDTO();
		data.id = +id;
		data.nom = nom;
		data.idParent = idParent; // TODO : vérifier si on a bien un null et pas un undefined
		data.requestedUserId = (res.locals as Utilisateur).id;
		if (Array.isArray(permsDossier) && permsDossier?.length > 0) {
			data.permsDossier = permsDossier;
		}

		const updatedDir = await this.dirsService.updateDir(+id, nom);

		if (!updatedDir) {
			return res.status(404).json(new Res(404, "Dossier non trouvé"));
		}

		return res
			.status(200)
			.json(new Res(200, "Dossier mis à jour", updatedDir));
	}

	// DELETE /:id
	private async deleteDir(req: Request, res: Response) {
		// Vérification des droits de l'utilisateur
		const hasRights = await this.authService.verifyUser(req, res);
		if (!hasRights) return res;

		// Récupération des données de la requête
		const { id } = req.params;

		const result = await this.dirsService.deleteDir(
			+id,
			res.locals.user.id,
		);

		if (!result) {
			return res.status(404).json(new Res(404, "Dossier non trouvé"));
		} else if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res.status(200).json(new Res(200, "Dossier supprimé", result));
	}
}
