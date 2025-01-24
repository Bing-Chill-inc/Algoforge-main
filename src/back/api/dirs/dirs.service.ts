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
	 * Crée un dossier.
	 * @param dir Données de création du dossier.
	 * @returns Le dossier créé.
	 */
	async createDir(dir: DirCreateDTO) {
		// Vérification des droits de l'utilisateur
		if (dir.requestedUserId !== dir.ownerId) {
			return new Res(
				403,
				"Vous n'avez pas les droits pour créer ce dossier.",
			);
		}

		const dossierRepository = AppDataSource.manager.getRepository(Dossier);
		const permDirRepository =
			AppDataSource.manager.getRepository(PermDossier);
        
        // Création du dossier
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
}
