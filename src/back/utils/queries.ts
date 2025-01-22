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

/**
 * Vérifie si un utilisateur a des droits sur un dossier.
 * @param userId L'identifiant de l'utilisateur.
 * @param dirId L'identifiant du dossier.
 * @returns true si l'utilisateur a des droits sur le dossier, false sinon.
 * @category Utils
 */
export async function hasRightsUserOnDir(userId: number, dirId: number) {
	const permDirRepository = AppDataSource.getRepository(PermDossier);

	let permsDir: PermDossier[];
	let hasRightsResult = false;
	do {
		// Récupère les permissions de l'utilisateur sur le dossier donné.
		permsDir = await permDirRepository.find({
			relations: { utilisateur: true, dossier: true },
			where: { idDossier: dirId, idUtilisateur: userId },
		});

		// Vérifie si l'utilisateur a des droits sur le dossier.
		let hasRightsOnDir = false;
		for (const perm of permsDir) {
			if (
				perm.droits === Droits.Owner ||
				perm.droits === Droits.ReadWrite ||
				perm.droits === Droits.ReadOnly
			) {
				hasRightsOnDir = true;
				break;
			}
		}

		// Si l'utilisateur n'a pas de droits sur le dossier, on remonte d'un niveau.
		if (!hasRightsOnDir) {
			const parentDir = permsDir[0].dossier.idParent;
			if (parentDir) {
				dirId = parentDir.id;
			}
		}
		// Sinon, on sort de la boucle.
		else {
			hasRightsResult = true;
			break;
		}
	} while (permsDir[0].dossier.idParent !== null);

	return hasRightsResult;
}

// NOTE: permsAlgo[0].algorithme.dossier.id ne fonctionnera probablement pas
// en raison de soit erreur de conception dans Dossier, soit d'implémentation
// dans await permAlgoRepository.find()...
export async function hasRightsOnAlgo(userId: number, algoId: number) {
	const permAlgoRepository = AppDataSource.getRepository(PermAlgorithme);

	// Réupère les permissions de l'utilisateur sur l'algorithme donné.
	const permsAlgo = await permAlgoRepository.find({
		relations: { utilisateur: true, algorithme: true },
		where: { idAlgorithme: algoId, idUtilisateur: userId },
	});

	// Vérifie si l'utilisateur a des droits sur l'algorithme.
	let hasRights = false;
	for (const perm of permsAlgo) {
		if (
			perm.droits === Droits.Owner ||
			perm.droits === Droits.ReadWrite ||
			perm.droits === Droits.ReadOnly
		) {
			hasRights = true;
			break;
		}
	}

	if (!hasRights) {
		// Vérifie si l'utilisateur a des droits sur le dossier contenant l'algorithme.
		hasRights = await hasRightsUserOnDir(
			userId,
			permsAlgo[0].algorithme.dossier.id,
		);
	}

	return hasRights;
}

// TODO: parcours récursif qui remonte les dossiers parent,
// renvoyant leur nombres + leur permissions additionnées
