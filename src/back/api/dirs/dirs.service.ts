import {
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "fs";
import { Dossier } from "../../db/schemas/Dossier.schema";
import { AppDataSource } from "../../db/data-source";
import { PermDossier } from "../../db/schemas/PermDossier.schema";
import { Droits } from "../../types/droits.enum";
import { DirCreateDTO, DirUpdateDTO } from "./dirs.dto";
import { Res } from "../../types/response.entity";
import path from "path";
import { Logger } from "../../utils/logger";

export class DirsService {
    /**
     * Chemin vers le dossier contenant les dossiers.
     * @public
     * @type {string}
     * @readonly
     */
    public static readonly dataPath: string = path.join(
        __dirname,
        "../../../../data/dirs/",
    );

    /**
     * Récupère les dossiers que l'utilisateur a le droit de voir (propriétaire, écriture+lecture, lecture seule), et qui se situent à la racine.
     * @param id Id de l'utilisateur.
     * @returns Les dossiers de l'utilisateur.
     */
}