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
} from "../../types/response.entity";
import path from "path";
import { Logger } from "../../utils/logger";
import { rightsOfUserOnAlgo, rightsOfUserOnDir } from "../../utils/queries";
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
	 * Récupère les permissions des algorithmes que l'utilisateur a le droit de voir (propriétaire, écriture+lecture, lecture seule).
	 * @param id Id de l'utilisateur.
	 * @param requestedUserId Id de l'utilisateur qui demande les algorithmes.
	 * @param dirId Id du dossier.
	 * @returns Les algorithmes de l'utilisateur.
	 */
	// NOTE: dirId est de quel type lors de l'appel de la fonction ? (number ou null)
	async getAlgosPermsOfUser(
		id: number,
		requestedUserId: number,
		dirId: number,
	) {
		const permAlgoRepository =
			AppDataSource.manager.getRepository(PermAlgorithme);

		// Récupération des algorithmes de l'utilisateur.
		if (dirId) {
			// Vérification des droits de l'utilisateur sur le dossier.
			const rights = await rightsOfUserOnDir(requestedUserId, dirId);
			if (!rights) {
				return new ForbiddenRes(Responses.General.Forbidden);
			}

			// Récupération des algorithmes de l'utilisateur dans le dossier.
			const algos = await permAlgoRepository.find({
				relations: { algorithme: true },
				where: {
					idUtilisateur: id,
					algorithme: {
						dossier: {
							id: dirId,
						},
					},
				},
			});

			if (!algos) {
				return new NotFoundRes(Responses.Algo.By_User.Not_found);
			}
			return new OkRes(Responses.Algo.By_User.Found, algos);
		} else {
			const algos = await permAlgoRepository.find({
				relations: { algorithme: true },
				where: {
					idUtilisateur: id,
					algorithme: { dossier: null },
				},
			});

			if (!algos) {
				return new NotFoundRes(Responses.Algo.By_User.Not_found);
			}

			// Vérifier que l'utilisateur a le droit de voir ces algorithmes.
			for (const [index, algo] of algos.entries()) {
				const rights = await rightsOfUserOnAlgo(
					requestedUserId,
					algo.idAlgorithme,
				);
				if (!rights) {
					algos.splice(index, 1);
				}
			}
			if (algos.length === 0) {
				return new NotFoundRes(Responses.Algo.By_User.Not_found);
			}

			return new OkRes(Responses.Algo.By_User.Found, algos);
		}
	}

	/**
	 * Récupère un algorithme.
	 * @param id Id de l'algorithme.
	 * @param requestedUserId Id de l'utilisateur qui demande l'algorithme.
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
		const rights = await rightsOfUserOnAlgo(requestedUserId, id);
		if (!rights) return null;

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

		// TODO : Ranger l'algorithme dans le dossier de l'owner
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
	// TODO : Si l'utilisateur renvoie le même algo, ne rien faire
	async updateAlgo(algo: AlgoUpdateDTO) {
		// Récupération de l'algorithme.
		const algoToUpdate = await this.getAlgo(algo.id, algo.requestedUserId);
		if (!algoToUpdate) return null;

		// Vérification des droits de l'utilisateur.
		const rights = await rightsOfUserOnAlgo(algo.id, algo.requestedUserId);
		if (!rights || rights === Droits.ReadWrite || rights === Droits.Owner)
			return new ForbiddenRes(Responses.General.Forbidden);

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

		if (algo.dossierId) {
			algoToUpdate.idDossier = algo.dossierId;
		}

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
		const rights = await rightsOfUserOnAlgo(requestedUserId, id);
		if (!rights) return new ForbiddenRes(Responses.General.Forbidden);

		// Suppression de l'algorithme.
		try {
			// Suppression des permissions de l'algorithme.
			for (const perm of algo.permAlgorithmes) {
				await AppDataSource.manager
					.getRepository(PermAlgorithme)
					.delete(perm);
			}
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
