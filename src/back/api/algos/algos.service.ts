import {
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "fs";
import { Algorithme } from "../../db/schemas/Algorithme.schema";
import { AppDataSource } from "../../db/data-source";
import { PermAlgorithme } from "../../db/schemas/PermAlgorithme.schema";
import { Droits } from "../../types/droits.enum";
import { AlgoCreateDTO, AlgoUpdateDTO } from "./algos.dto";
import { AlgoValidator } from "../../utils/algoValidator";
import {
	BadRequestRes,
	ForbiddenRes,
	InternalServerErrorRes,
	NotFoundRes,
	OkRes,
	Res,
} from "../../types/response.entity";
import path from "path";
import { Logger } from "../../utils/logger";
import { getOwnerOfAlgo } from "../../utils/queries";
import { Responses } from "../../constants/responses.const";

/**
 * Service pour les algorithmes.
 * @hideconstructor
 * @category Services
 * @category Algorithmes
 */
export class AlgosService {
	/**
	 * Chemin vers le dossier contenant les algorithmes.
	 * @public
	 * @type {string}
	 * @readonly
	 */
	public static readonly dataPath: string = path.join(
		__dirname,
		"../../../../data/algos/",
	);

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
	async getAlgo(id: number, requestedUserId: number) {
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);

		// Récupération de l'algorithme.
		const algo = await algoRepository.findOne({
			where: { id: id },
			relations: { permAlgorithmes: true },
		});
		if (!algo) return null;

		// Vérification des droits de l'utilisateur.
		let hasRights = false;
		for (const perm of algo.permAlgorithmes) {
			if (
				perm.idUtilisateur === requestedUserId &&
				(perm.droits === Droits.Owner ||
					perm.droits === Droits.ReadWrite ||
					perm.droits === Droits.ReadOnly)
			) {
				hasRights = true;
				break;
			}
		}
		if (!hasRights) return null;

		// Récupération de l'algorithme dans le système de fichiers.
		const algoData = this.readAlgoFromDisk(id);
		if (!algoData) return null;

		return { ...algo, sourceCode: algoData };
	}

	/**
	 * Crée un algorithme.
	 * @param algo Données de l'algorithme à créer.
	 * @returns L'algorithme créé.
	 */
	async createAlgo(algo: AlgoCreateDTO) {
		// Vérification des droits de l'utilisateur.
		if (algo.requestedUserId !== algo.ownerId) {
			return new ForbiddenRes(Responses.Algo.Forbidden_create);
		}

		// Validation de l'algorithme.
		const validationResult = AlgoValidator.validateAlgo(algo.sourceCode);
		if (!validationResult.success) {
			return new BadRequestRes(Responses.Algo.Invalid, validationResult);
		}

		const algoRepository = AppDataSource.manager.getRepository(Algorithme);
		const permAlgoRepository =
			AppDataSource.manager.getRepository(PermAlgorithme);

		// Création de l'algorithme.
		const newAlgo = new Algorithme();
		newAlgo.nom = algo.nom;
		newAlgo.dateCreation = new Date().getTime();
		newAlgo.dateModification = new Date().getTime();
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
		this.writeAlgoToDisk(savedAlgo.id, algo.sourceCode);

		return savedAlgo;
	}

	/**
	 * Met à jour un algorithme.
	 * @param algo Données de l'algorithme à mettre à jour.
	 * @returns L'algorithme mis à jour.
	 */
	// TODO: mettre à jour les permissions de l'algorithme.
	async updateAlgo(algo: AlgoUpdateDTO) {
		// Récupération de l'algorithme.
		const algoToUpdate = await this.getAlgo(algo.id, algo.requestedUserId);
		if (!algoToUpdate) return null;

		// Vérification des droits de l'utilisateur.
		const ownerAlgo = await getOwnerOfAlgo(algoToUpdate.id);
		if (!ownerAlgo) return null;
		const ownerPerm = new PermAlgorithme();
		ownerPerm.idUtilisateur = ownerAlgo.id;
		ownerPerm.idAlgorithme = algoToUpdate.id;
		ownerPerm.droits = Droits.Owner;
		if (
			!algoToUpdate.permAlgorithmes ||
			algoToUpdate.permAlgorithmes.length === 0
		) {
			algoToUpdate.permAlgorithmes = [ownerPerm];
		} else {
			algoToUpdate.permAlgorithmes.push(ownerPerm);
		}

		for (const perm of algoToUpdate.permAlgorithmes) {
			if (
				perm.idUtilisateur === algo.requestedUserId &&
				(perm.droits === Droits.Owner ||
					perm.droits === Droits.ReadWrite)
			) {
				return new ForbiddenRes(Responses.Algo.Forbidden_update);
			}
		}

		// Validation de l'algorithme.
		const validationResult = AlgoValidator.validateAlgo(algo.sourceCode);
		if (!validationResult.success) {
			return new BadRequestRes(Responses.Algo.Invalid, validationResult);
		}
		algo.sourceCode = JSON.parse(JSON.stringify(validationResult.data));

		const algoRepository = AppDataSource.manager.getRepository(Algorithme);

		// Mise à jour de l'algorithme.
		algoToUpdate.nom = algo.nom;
		algoToUpdate.dateModification = new Date().getTime();
		// Enregistrement de l'algorithme.
		const savedAlgo = await algoRepository.save(algoToUpdate);

		// Mise à jour de l'algorithme dans le système de fichiers.
		this.writeAlgoToDisk(savedAlgo.id, algo.sourceCode);

		return savedAlgo;
	}

	/**
	 * Supprime un algorithme. Seul le propriétaire de l'algorithme peut le supprimer.
	 * @param id Id de l'algorithme à supprimer.
	 * @param requestedUserId Id de l'utilisateur qui demande la suppression.
	 * @returns L'algorithme supprimé.
	 */
	async deleteAlgo(id: number, requestedUserId: number) {
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);

		// Récupération de l'algorithme.
		const algo = await algoRepository.findOne({
			where: { id: id },
			relations: {
				permAlgorithmes: true,
			},
		});
		if (!algo) return null;

		// Vérification des droits de l'utilisateur.
		const ownerAlgo = await getOwnerOfAlgo(id);
		if (ownerAlgo.id != requestedUserId)
			return new ForbiddenRes(Responses.General.Forbidden);

		// Suppression de l'algorithme.
		try {
			// Suppression des permissions de l'algorithme.
			algo.permAlgorithmes.forEach(async (perm) => {
				await AppDataSource.manager
					.getRepository(PermAlgorithme)
					.delete(perm);
			});
			delete algo.permAlgorithmes;
			// Suppression de l'algorithme en base de données.
			const deletedAlgo = await algoRepository.delete(algo.id);

			// Suppression de l'algorithme du système de fichiers.
			const result = this.deleteAlgoFromDisk(id);
			if (!result) return new NotFoundRes(Responses.Algo.Not_found);
			return new OkRes(Responses.Algo.Success.Deleted, deletedAlgo);
		} catch (error) {
			if (error instanceof Error)
				Logger.error(error.stack, "AlgosService: deleteAlgo");
			return new InternalServerErrorRes(
				Responses.Algo.Errors.While_deleting_algo,
			);
		}
	}

	private readAlgoFromDisk(id: number) {
		const algoPath = path.normalize(AlgosService.dataPath + id + ".json");
		try {
			if (existsSync(algoPath)) {
				const algo = JSON.parse(
					readFileSync(algoPath, { encoding: "utf8" }),
				);
				return algo;
			}
			return null;
		} catch (error) {
			if (error instanceof Error)
				Logger.error(error.message, "AlgosService: readAlgoFromDisk");
			throw error;
		}
	}

	private writeAlgoToDisk(id: number, algo: Object) {
		const algoPath = path.normalize(AlgosService.dataPath + id + ".json");
		try {
			if (!existsSync(algoPath))
				mkdirSync(path.dirname(algoPath), { recursive: true });

			writeFileSync(algoPath, JSON.stringify(algo), {
				encoding: "utf8",
				flag: "w",
			});
			return true;
		} catch (error) {
			if (error instanceof Error)
				Logger.error(error.message, "AlgosService: writeAlgoToDisk");
			throw error;
		}
	}

	private deleteAlgoFromDisk(id: number) {
		const algoPath = path.normalize(AlgosService.dataPath + id + ".json");
		try {
			if (existsSync(algoPath)) {
				unlinkSync(algoPath);
				return true;
			}
			return false;
		} catch (error) {
			if (error instanceof Error)
				Logger.error(error.message, "AlgosService: deleteAlgoFromDisk");
			throw error;
		}
	}
}
