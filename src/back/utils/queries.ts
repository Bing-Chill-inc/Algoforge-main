import { AppDataSource } from "../db/data-source";
import { PermAlgorithme } from "../db/schemas/PermAlgorithme.schema";
import { PermDossier } from "../db/schemas/PermDossier.schema";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";
import { Droits } from "../types/droits.enum";

/**
 * Récupère l'utilisateur propriétaire d'un algorithme.
 * @param algoId L'identifiant de l'algorithme.
 * @returns L'utilisateur propriétaire de l'algorithme.
 * @category Utils
 */
export async function getOwnerOfAlgo(algoId: number): Promise<Utilisateur> {
	const permAlgoRepository = AppDataSource.getRepository(PermAlgorithme);
	const owner = await permAlgoRepository.findOne({
		relations: { utilisateur: true },
		where: { idAlgorithme: algoId, droits: Droits.Owner },
	});
	return owner.utilisateur;
}


/**
 * Récupère l'utilisateur propriétaire d'un dossier
 * @param dirId L'identifiant du dossier.
 * @returns L'utilisateur propriétaire du dossier.
 * @category Utils
 */
export async function getOwnerOfDir(dirId: number): Promise<Utilisateur> {
	const permDirRepository = AppDataSource.getRepository(PermDossier);
	const owner = await permDirRepository.findOne({
		relations: { utilisateur: true },
		where: { idDossier: dirId, droits: Droits.Owner },
	});
	return owner.utilisateur;
}

// TODO : Faire une fonction pour vérifier les droits de l'utilisateur sur un dossier