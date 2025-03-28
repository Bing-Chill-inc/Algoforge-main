import { Router, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AlgosService } from "./algos.service";
import { Logger } from "../../utils/logger";
import { AlgoCreateDTO, AlgoSelectDTO, AlgoUpdateDTO } from "./algos.dto";
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

	/**
	 * GET /byUserId/:id ?deleted=:deleted ?sorted=:sorted
	 * NOTE: ?dirId=:dirId est temporairement désactivé.
	 * Récupérer les algorithmes d'un utlisateur.
	 * @param req.params.id Id de l'utilisateur.
	 * @param req.query.deleted Booléen pour savoir si on veut récupérer les algorithmes supprimés ou non.
	 * @param req.query.sorted String correspondant à un type de tri des algorithmes. Voir l'énum {@link SortAlgos}
	 * NOTE: @param req.params.dirId Id du dossier dans lequel on recherche les algorithmes.
	 * @remarks
	 * Besoin d'être connecté, voir: {@link UsersService.verify}
	 * Si algorithmes trouvés, voir la structure suivante: {@link PermAlgorithme}
	 * @example
	 * // Retours possibles :
	 * {status: 404, message: "Dossier non trouvé" }
	 * {status: 404, message: "Aucun algorithme trouvé" }
	 * {status: 200, message: "Algorithmes trouvés", data: [new PermAlgorithme()] }
	 */
	private async getAlgosPermsOfUser(req: Request, res: Response) {
		let { id } = req.params;
		const user = res.locals.user as Utilisateur;
		const { deleted, sorted } = req.query;
		// FIXME: Les dossiers sont temporairement désactivé.
		// const { dirId } = req.query as { dirId: string };
		const dirId = null;

		// Si dirId est null, on se situe à la racine, sinon on se situe dans un dossier, on récupère l'owner du dossier
		if (dirId) {
			// Récupérer l'owner du dossier
			const owner = await getOwnerOfDir(+dirId);
			if (!owner) {
				return res
					.status(NotFoundRes.statut)
					.json(new NotFoundRes(Responses.Dir.Not_found));
			}
			id = String(owner.id);
		}

		const selectData = new AlgoSelectDTO();
		selectData.requestedUserId = user.id;
		selectData.userId = +id;
		selectData.deleted = deleted === "true" ? true : false;
		selectData.sorted = sorted ? String(sorted) : "nom";
		// Récupération des permissions des algorithmes de l'utilisateur dans le dossier
		const algosPermsResponse = await this.algosService.getAlgosPermsOfUser(
			selectData,
		);

		return res.status(algosPermsResponse.statut).json(algosPermsResponse);
	}

	/**
	 * GET /:id
	 * Récupérer un algorithme.
	 * @param req.params.id Id de l'algorithme
	 * @remarks
	 * Besoin d'être connecté, voir: {@link UsersService.verify}
	 * Pour accéder au code source de l'algorithme, lire la propriété sourceCode.
	 * @example
	 * // Retours possibles :
	 * {status: 404, message: "Algorithme non trouvé" }
	 * {status: 200, message: "Algorithme trouvé", data: new Algo() }
	 */
	// TODO: Bloquer la récupération de l'algo s'il est supprimé (= dans la corbeille).
	private async getAlgo(req: Request, res: Response) {
		// Récupération des données de la requête
		const { id } = req.params;
		const user = res.locals.user as Utilisateur;

		const algo = await this.algosService.getAlgo(+id, user.id);

		if (!algo) {
			return res
				.status(NotFoundRes.statut)
				.json(new NotFoundRes(Responses.Algo.Not_found));
		}

		return res
			.status(OkRes.statut)
			.json(new OkRes(Responses.Algo.Success.Found, algo));
	}

	/**
	 * POST /
	 * Créer un algorithme.
	 * @param req.body {@link AlgoCreateDTO}
	 * @remarks
	 * Besoin d'être connecté, voir: {@link UsersService.verify}
	 * @example
	 * // Retours possibles :
	 * {status: 400, message: "Données manquantes" }
	 * {status: 400, message: "Algorithme invalide" }
	 * {status: 403, message: "Vous n'avez pas les droits pour créer cet algorithme" }
	 * {status: 201, message: "Algorithme créé", data: new Algo() }
	 */
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

		const result = await this.algosService.createAlgo(data);
		if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res
			.status(CreatedRes.statut)
			.json(new CreatedRes(Responses.Algo.Success.Created, result));
	}

	/**
	 * PUT /:id
	 * Mettre à jour un algorithme.
	 * @param req.params.id Id de l'algorithme
	 * @param req.body {@link AlgoUpdateDTO}
	 * @remarks
	 * Besoin d'être connecté, voir: {@link UsersService.verify}
	 * @example
	 * // Retours possibles :
	 * {status: 400, message: "Données manquantes" }
	 * {status: 404, message: "Algorithme non trouvé" }
	 * {status: 400, message: "Algorithme invalide" }
	 * {status: 403, message: "Vous n'avez pas les droits pour modifier cet algorithme" }
	 * {status: 200, message: "Algorithme mis à jour", data: new Algo() }
	 */
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
		if (req.body.dossierId) {
			data.dossierId = req.body.dossierId;
		}

		const updatedAlgo = await this.algosService.updateAlgo(data);

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

	/**
	 * DELETE /:id
	 * Supprimer un algorithme.
	 * @param req.params.id Id de l'algorithme
	 * @remarks
	 * Besoin d'être connecté, voir: {@link UsersService.verify}
	 * @example
	 * // Retours possibles :
	 * {status: 404, message: "Algorithme non trouvé" }
	 * {status: 403, message: "Permission refusée" }
	 * {status: 500, message: "Erreur lors de la suppression de l'algorithme" }
	 * {status: 200, message: "Algorithme supprimé" }
	 */
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
				.json(new NotFoundRes(Responses.Algo.Not_found));
		} else if (result instanceof Res) {
			return res.status(result.statut).json(result);
		}

		return res
			.status(OkRes.statut)
			.json(new OkRes(Responses.Algo.Success.Deleted, result));
	}
}
