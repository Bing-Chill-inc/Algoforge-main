import { Repository } from "typeorm";
import { AppDataSource } from "../db/data-source";
import { PermAlgorithme } from "../db/schemas/PermAlgorithme.schema";
import { PermDossier } from "../db/schemas/PermDossier.schema";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";
import { Droits } from "../types/droits.enum";
import { Algorithme } from "../db/schemas/Algorithme.schema";

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
 * Vérifie les droits d'un utilisateur sur un dossier.
 * @param userId L'identifiant de l'utilisateur.
 * @param dirId L'identifiant du dossier.
 * @returns Droits de l'utilisateur sur le dossier ou null si l'utilisateur n'a pas de droits.
 * @category Utils
 */
export async function rightsOfUserOnDir(
	userId: number,
	dirId: number,
): Promise<Droits | null> {
	if (!userId || !dirId) return null;

	const permDirRepository: Repository<PermDossier> =
		AppDataSource.getRepository(PermDossier);

	let permsDir: PermDossier;
	let highestRights: Droits = null;
	let rights: Droits;
	do {
		rights = null;

		// Récupère les permissions de l'utilisateur sur le dossier donné.
		permsDir = await permDirRepository.findOne({
			relations: { utilisateur: true, dossier: true },
			where: { idDossier: dirId, idUtilisateur: userId },
		});

		// Stocke les droits de l'utilisateur sur le dossier.
		if (permsDir) {
			rights = <Droits>permsDir.droits;
		}

		// Si l'utilisateur a les droits propriétaires, on sort de la boucle.
		if (rights === Droits.Owner) {
			highestRights = Droits.Owner;
			break;
		}

		// Sinon, on continue, en stockant les droits les plus hauts.
		else {
			const parentDir: number = permsDir[0].dossier.idParent;
			if (parentDir) {
				dirId = parentDir;
			}

			if (
				rights &&
				(highestRights === null || highestRights != Droits.ReadWrite)
			) {
				highestRights = rights;
			}
		}
	} while (permsDir[0].dossier.idParent !== null);

	return highestRights;
}

// NOTE: permsAlgo[0].algorithme.dossier.id ne fonctionnera probablement pas
// en raison de soit erreur de conception dans Dossier, soit d'implémentation
// dans await permAlgoRepository.find()...
/**
 * Vérifie les droits d'un utilisateur sur un algorithme.
 * @param userId L'identifiant de l'utilisateur.
 * @param algoId L'identifiant de l'algorithme.
 * @returns Droits de l'utilisateur sur l'algorithme ou null si l'utilisateur n'a pas de droits.
 * @category Utils
 */
export async function rightsOfUserOnAlgo(
	userId: number,
	algoId: number,
): Promise<Droits | null> {
	const permAlgoRepository: Repository<PermAlgorithme> =
		AppDataSource.getRepository(PermAlgorithme);
	const algoRepository: Repository<Algorithme> =
		AppDataSource.getRepository(Algorithme);

	// Récupère les permissions de l'utilisateur sur l'algorithme donné.
	const permAlgo: PermAlgorithme | null = await permAlgoRepository.findOne({
		relations: { utilisateur: true, algorithme: true },
		where: { idAlgorithme: algoId, idUtilisateur: userId },
	});

	const algoRights: Droits = permAlgo ? <Droits>permAlgo.droits : null;

	// Si l'utilisateur a les droits propriétaires, on renvoie les droits propriétaires.
	if (permAlgo && algoRights === Droits.Owner) {
		return Droits.Owner;
	}

	// On récupère l'algorithme, plus précisément le dossier de l'algorithme.
	const algo: Algorithme | null = await algoRepository.findOne({
		where: { id: algoId },
	});
	// Récupère les droits de l'utilisateur sur le dossier de l'algorithme.
	// Vérifie si algo?.idDossier est null
	if (algo?.idDossier === null || algo?.idDossier === undefined) {
		return algoRights;
	}

	const dirRights: Droits = await rightsOfUserOnDir(userId, algo.idDossier);

	// Sinon, on compare les droits de l'utilisateur sur le dossier et l'algorithme, et on renvoie le plus élevé.
	if (
		!algoRights ||
		dirRights === Droits.Owner ||
		dirRights === Droits.ReadWrite
	) {
		return dirRights;
	}

	return algoRights;
}

// NOTE : Compter le nombre de dossiers jusqu'au dossier parent, pour limiter le nombre d'imbrications (7 max)

/**
 * Compte le nombre de dossiers parents d'un dossier.
 * @param dirId L'identifiant du dossier.
 * @returns Le nombre de dossiers parents.
 * @category Utils
 */
export async function countParents(dirId: number): Promise<number> {
	const permDirRepository = AppDataSource.getRepository(PermDossier);

	let permsDir: PermDossier;
	let count = 0;

	// Récupère le dossier parent du dossier donné.
	permsDir = await permDirRepository.findOne({
		relations: { dossier: true },
		where: { idDossier: dirId },
	});

	// Compte le nombre de dossiers parents jusqu'à la racine.
	while (permsDir[0].dossier.idParent !== null) {
		count++;
		dirId = permsDir[0].dossier.idParent;
	}

	return count;
}
