import { Dossier } from "../../db/schemas/Dossier.schema";
import { AppDataSource } from "../../db/data-source";
import { PermDossier } from "../../db/schemas/PermDossier.schema";
import { Droits } from "../../types/droits.enum";
import { DirCreateDTO, DirUpdateDTO } from "./dirs.dto";
import { ForbiddenRes, OkRes } from "../../types/response.entity";
import { Responses } from "../../constants/responses.const";
import { rightsOfUserOnDir } from "../../utils/queries";

export class DirsService {
	/**
	 * Récupère les dossiers que l'utilisateur a le droit de voir (propriétaire, écriture+lecture, lecture seule).
	 * @param id Id de l'utilisateur.
	 * @param idParent Id du dossier parent.
	 * @returns Les dossiers de l'utilisateur.
	 */
	async getDirsPermsOfUser(id: number, idParent: number) {
		const permDirRepository =
			AppDataSource.manager.getRepository(PermDossier);

		// Récupération des dossiers de l'utilisateur.
		if (idParent) {
			return await permDirRepository.find({
				relations: { dossier: true },
				where: {
					idUtilisateur: id,
					dossier: {
						idParent: idParent,
					},
				},
			});
		} else {
			return await permDirRepository.find({
				relations: { dossier: true },
				where: {
					idUtilisateur: id,
					dossier: {
						idParent: null,
					},
				},
			});
		}
	}

	/**
	 * Récupère un dossier.
	 * @param id Id du dossier.
	 * @returns Le dossier.
	 */
	async getDir(id: number, requestedUserId: number) {
		const dossierRepository = AppDataSource.manager.getRepository(Dossier);

		// Récupération du dossier.
		const dir = await dossierRepository.findOne({
			where: { id: id },
			relations: { permDossiers: true },
		});
		if (!dir) return null;

		// Récupération des permissions du dossier en utilisant la query rightsOfUserOnDir
		const perms = rightsOfUserOnDir(requestedUserId, id);

		// Vérification des droits de l'utilisateur.
		if (!perms) return null;

		return dir;
	}

	/**
	 * Crée un dossier.
	 * @param dir Données de création du dossier.
	 * @returns Le dossier créé.
	 */
	async createDir(dir: DirCreateDTO) {
		// Vérification des droits de l'utilisateur.
		if (dir.requestedUserId !== dir.ownerId) {
			return new ForbiddenRes(Responses.Dir.Forbidden_create);
		}

		const dossierRepository = AppDataSource.manager.getRepository(Dossier);
		const permDirRepository =
			AppDataSource.manager.getRepository(PermDossier);

		// On vérifie si le dossier parent existe
		const parentDir = await dossierRepository.findOne({
			where: { id: dir.idParent },
		});

		// Si le dossier parent n'existe pas, on renvoie une erreur.
		if (dir.idParent && !parentDir) {
			return new ForbiddenRes(Responses.Dir.Parent_Not_found);
		}

		// Vérification des droits de l'utilisateur
		const perms = await rightsOfUserOnDir(
			dir.requestedUserId,
			dir.idParent,
		);
		if (!perms || perms == Droits.ReadOnly)
			return new ForbiddenRes(Responses.Dir.Forbidden_create);

		// Création du dossier.
		const newDir = new Dossier();
		newDir.nom = dir.nom;
		newDir.idParent = dir.idParent;
		newDir.dateCreation = new Date().getTime();
		newDir.dateModification = new Date().getTime();
		// Enregistrement du dossier en base de données.
		const savedDir = await dossierRepository.save(newDir);

		// Création du droit d'ownership.
		const newPerm = new PermDossier();
		newPerm.idUtilisateur = dir.ownerId;
		newPerm.idDossier = savedDir.id;
		newPerm.droits = Droits.Owner;
		// Enregistrement du droit.
		const savedPerm = await permDirRepository.save(newPerm);
		savedDir.permDossiers = [savedPerm];

		return savedDir;
	}

	/**
	 * Met à jour un dossier.
	 * @param dir Données de mise à jour du dossier.
	 * @returns Le dossier mis à jour.
	 */
	async updateDir(dir: DirUpdateDTO) {
		// Récupération du dossier.
		const dirToUpdate = await this.getDir(dir.id, dir.requestedUserId);
		if (!dirToUpdate) return null;

		// Vérification des droits de l'utilisateur.
		const perms = await rightsOfUserOnDir(dir.requestedUserId, dir.id);

		if (!perms || perms == Droits.ReadOnly) {
			return new ForbiddenRes(Responses.Dir.Forbidden_update);
		}

		const dossierRepository = AppDataSource.manager.getRepository(Dossier);

		// Mise à jour du dossier.
		dirToUpdate.nom = dir.nom;
		dirToUpdate.dateModification = new Date().getTime();
		if (dir.idParent) dirToUpdate.idParent = dir.idParent;

		const savedDir = await dossierRepository.save(dirToUpdate);

		// TODO : Mettre à jour les permissions du dossier.


		return savedDir;
	}

	/**
	 * Supprime un dossier. Seul le propriétaire du dossier peut le supprimer.
	 * @param dirId Id du dossier à supprimer.
	 * @param requestedUserId Id de l'utilisateur qui demande la suppression.
	 * @returns Le dossier supprimé.
	 */
	// TODO : Vérifier les droits de l'utilisateur (query)
	async deleteDir(dirId: number, requestedUserId: number) {
		const dossierRepository = AppDataSource.manager.getRepository(Dossier);

		// Récupération du dossier
		const dir = await dossierRepository.findOne({
			where: { id: dirId },
			relations: { permDossiers: true },
		});
		if (!dir) return null;

		// Vérification des droits de l'utilisateur.

		// Supression des permissions du dossier.
		dir.permDossiers.forEach(async (perm) => {
			await AppDataSource.manager.getRepository(PermDossier).remove(perm);
		});
		delete dir.permDossiers;

		// Suppression de tous les algos du dossier.
		// TODO : Récupérer les algos du dossier

		// Suppression de tous les sous-dossiers du dossier.
		// TODO : Récupérer les sous-dossiers du dossier

		// Suppression du dossier.
		const deletedDir = await dossierRepository.remove(dir);

		return new OkRes(Responses.Dir.Success.Deleted, deletedDir);
	}
}
