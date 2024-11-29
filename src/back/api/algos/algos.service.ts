import { Algorithme } from "../../db/schemas/Algorithme.schema";
import { AppDataSource } from "../../db/data-source";
import { PermAlgorithme } from "../../db/schemas/PermAlgorithme.schema";
import { Droits } from "../../types/droits.enum";
import { AlgoCreateDTO, AlgoUpdateDTO } from "./algos.dto";

export class AlgosService {
	/**
	 * Récupère les algorithmes que l'utilisateur a le droit de voir (propriétaire, écriture+lecture, lecture seule).
	 * @param id Id de l'utilisateur.
	 * @returns Les algorithmes de l'utilisateur.
	 */
	async getAlgosOfUser(id: number) {
		const permAlgoRepository =
			AppDataSource.manager.getRepository(PermAlgorithme);

		// Récupération des algorithmes de l'utilisateur.
		return await permAlgoRepository.find({
			relations: { algorithme: true },
			where: {
				idUtilisateur: id,
			},
		});
	}

	/**
	 * Récupère un algorithme.
	 * @param id Id de l'algorithme.
	 * @returns L'algorithme.
	 */
	// TODO: vérifier si l'utilisateur de la requête a le droit de voir l'algorithme.
	async getAlgo(id: number) {
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);

		// Récupération de l'algorithme.
		return await algoRepository.findOne({
			where: { id: id },
			// relations: { permAlgorithmes: true },
		});
	}

	/**
	 * Crée un algorithme.
	 * @param algo Données de l'algorithme à créer.
	 * @returns L'algorithme créé.
	 */
	async createAlgo(algo: AlgoCreateDTO) {
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);
		const permAlgoRepository =
			AppDataSource.manager.getRepository(PermAlgorithme);

		// Création de l'algorithme.
		const newAlgo = new Algorithme();
		newAlgo.nom = algo.nom;
		newAlgo.dateCreation = new Date();
		newAlgo.dateModification = new Date();
		// Enregistrement de l'algorithme en base de données.
		const savedAlgo = await algoRepository.save(newAlgo);

		// Création du droit d'ownership.
		const newPerm = new PermAlgorithme();
		newPerm.idUtilisateur = algo.ownerId;
		newPerm.idAlgorithme = savedAlgo.id;
		newPerm.droits = Droits.Owner;
		// Enregistrement du droit.
		const savedPerm = await permAlgoRepository.save(newPerm);
		savedAlgo.permAlgorithmes = [savedPerm];

		// Enregistrement de l'algorithme dans le système de fichiers.
		// TODO: à implémenter. utiliser algo.sourceCode.
		return savedAlgo;
	}

	/**
	 * Met à jour un algorithme.
	 * @param algo Données de l'algorithme à mettre à jour.
	 * @returns L'algorithme mis à jour.
	 */
	// TODO: vérifier si l'utilisateur de la requête a le droit de modifier l'algorithme.
	// TODO: mettre à jour l'algorithme dans le système de fichiers.
	async updateAlgo(algo: AlgoUpdateDTO) {
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);

		// Récupération de l'algorithme.
		const algoToUpdate = await algoRepository.findOne({
			where: { id: algo.id },
		});
		if (!algoToUpdate) {
			return null;
		}

		// Mise à jour de l'algorithme.
		algoToUpdate.nom = algo.nom;
		algoToUpdate.dateModification = new Date();

		// Enregistrement de l'algorithme.
		const savedAlgo = await algoRepository.save(algoToUpdate);

		return savedAlgo;
	}

	/**
	 * Supprime un algorithme.
	 * @param id Id de l'algorithme à supprimer.
	 * @returns L'algorithme supprimé.
	 */
	// TODO: vérifier si l'utilisateur de la requête a le droit de supprimer l'algorithme.
	async deleteAlgo(id: number) {
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);

		// Récupération de l'algorithme.
		const algo = await algoRepository.findOne({ where: { id: id } });
		if (!algo) {
			return null;
		}

		// Suppression de l'algorithme.
		const deletedAlgo = await algoRepository.delete(algo);
		// TODO: supprimer l'algorithme du système de fichiers.

		return deletedAlgo;
	}
}