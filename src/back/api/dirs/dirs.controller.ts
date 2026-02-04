import { Router, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { DirsService } from "./dirs.service";
import { Logger } from "../../utils/logger";
import { DirCreateDTO, DirUpdateDTO } from "./dirs.dto";
import {
    BadRequestRes,
    CreatedRes,
    NotFoundRes,
    OkRes,
    Res,
} from "../../types/response.entity";
import { AuthService } from "../auth/auth.service";
import { getOwnerOfDir } from "../../utils/queries";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { Responses } from "../../constants/responses.const";

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

    // GET /byUserId/:id
    private async getDirs(req: Request, res: Response) {
        // Vérification des droits de l'utilisateur
        const hasRights = await this.authService.verifyUser(req, res);
        if (!hasRights) return res;

        // Récupérations des données de la requête
        let { id, idParent } = req.params;

        // Si idParent est null, on se situe à la racine, sinon on se situe dans un dossier
        if (idParent) {
            // Récupérer l'owner du dossier
            id = String((await getOwnerOfDir(+idParent)).id);

            if (!id) {
                return res
                    .status(NotFoundRes.statut)
                    .json(new NotFoundRes(Responses.Dir.Parent_Not_found));
            }
        }

        const dirsPerms = await this.dirsService.getDirsPermsOfUser(+id, +idParent);

        if (!dirsPerms || dirsPerms.length === 0) {
            return res
                .status(NotFoundRes.statut)
                .json(new NotFoundRes(Responses.Dir.By_User.Not_found));
        }

        return res
            .status(OkRes.statut)
            .json(new OkRes(Responses.Dir.By_User.Found, dirsPerms));
    }

    // POST /
    private async createDir(req: Request, res: Response) {
        // Vérification des droits de l'utilisateur
        const hasRights = await this.authService.verifyUser(req, res);
        if (!hasRights) return res;

        // Récupération des données de la requête
        const { nom, ownerId, idParent } = req.body;
        if (!nom || !ownerId) {
            return res
                .status(BadRequestRes.statut)
                .json(new BadRequestRes(Responses.General.Missing_data));
        }

        const data = new DirCreateDTO();
        data.nom = nom;
        data.ownerId = ownerId;
        data.idParent = idParent; // TODO : vérifier si on a bien un null et pas un undefined
        data.requestedUserId = (res.locals as Utilisateur).id;

        const result = await this.dirsService.createDir(data);
        if (result instanceof Res) {
            return res.status(result.statut).json(result);
        }

        return res
            .status(CreatedRes.statut)
            .json(new CreatedRes(Responses.Dir.Success.Created, result));
    }

    // PUT /:id
    private async updateDir(req: Request, res: Response) {
        // Vérification des droits de l'utilisateur
        const hasRights = await this.authService.verifyUser(req, res);
        if (!hasRights) return res;

        // Récupération des données de la requête
        const { id } = req.params;
        const { nom, permsDossier, idParent } = req.body;
        if (!id || !nom) {
            return res
                .status(BadRequestRes.statut)
                .json(new BadRequestRes(Responses.General.Missing_data));
        }

        const data = new DirUpdateDTO();
        data.id = +id;
        data.nom = nom;
        data.idParent = idParent; // TODO : vérifier si on a bien un null et pas un undefined
        data.requestedUserId = (res.locals as Utilisateur).id;
        if (Array.isArray(permsDossier) && permsDossier?.length > 0) {
            data.permsDossier = permsDossier;
        }

        const updatedDir = await this.dirsService.updateDir(data);

        if (!updatedDir) {
            return res
                .status(NotFoundRes.statut)
                .json(new NotFoundRes(Responses.Dir.Not_found));
        }

        return res
            .status(OkRes.statut)
            .json(new OkRes(Responses.Dir.Success.Updated, updatedDir));
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
            return res
                .status(NotFoundRes.statut)
                .json(new NotFoundRes(Responses.Dir.Not_found));
        } else if (result instanceof Res) {
            return res.status(result.statut).json(result);
        }

        return res
            .status(OkRes.statut)
            .json(new OkRes(Responses.Dir.Success.Deleted, result));
    }
}
