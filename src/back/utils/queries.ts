import { AppDataSource } from "../db/data-source";
import { PermAlgorithme } from "../db/schemas/PermAlgorithme.schema";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";
import { Droits } from "../types/droits.enum";

/**
 * Récupère l'utilisateur propriétaire d'un algorithme.
 * @param algoId L'identifiant de l'algorithme.
 * @returns L'utilisateur propriétaire de l'algorithme.
 */
export async function getOwnerOfAlgo(algoId: number): Promise<Utilisateur> {
	const permAlgoRepository = AppDataSource.getRepository(PermAlgorithme);
	const owner = await permAlgoRepository.findOne({
		relations: { utilisateur: true },
		where: { idAlgorithme: algoId, droits: Droits.Owner },
	});
	return owner.utilisateur;
}
