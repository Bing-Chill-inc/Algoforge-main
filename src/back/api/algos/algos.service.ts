import { Repository } from "typeorm";
import { Algorithme } from "../../db/schemas/Algorithme.schema";
import { AppDataSource } from "../../db/data-source";
import { PermAlgorithme } from "../../db/schemas/PermAlgorithme.schema";
import { Droits } from "../../types/droits.enum";

export class AlgosService {
	// GET /byUserId/:id
	async getAlgosOfUser(req: any, res: any) {
		// Récupération des données de la requette.
		const { id } = req.params;
		const permAlgoRepository =
			AppDataSource.manager.getRepository(PermAlgorithme);

		// Récupération des algorithmes de l'utilisateur.
		const algos = await permAlgoRepository.find({
			relations: { algorithme: true },
			where: {
				idUtilisateur: id,
			},
		});
		if (!algos || algos.length === 0) {
			return res.status(404).json({ message: "Aucun algorithme trouvé" });
		}

		return res.status(200).json(algos);
	}

	// GET /:id
	// TODO: vérifier si l'utilisateur de la requête a le droit de voir l'algorithme.
	async getAlgo(req: any, res: any) {
		// Récupération des données de la requette.
		const { id } = req.params;
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);

		// Récupération de l'algorithme.
		const algo = await algoRepository.findOne({
			where: { id: id },
			// relations: { permAlgorithmes: true },
		});

		if (!algo) {
			return res.status(404).json({ message: "Algorithme non trouvé" });
		}

		return res.status(200).json(algo);
	}

	// POST /
	async createAlgo(req: any, res: any) {
		// Récupération des données de la requette.
		const { idUtilisateur, nom } = req.body;
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);
		const permAlgoRepository =
			AppDataSource.manager.getRepository(PermAlgorithme);

		// Création de l'algorithme.
		const newAlgo = new Algorithme();
		newAlgo.nom = nom;
		newAlgo.dateCreation = new Date();
		newAlgo.dateModification = new Date();
		// Enregistrement de l'algorithme en base de données.
		const savedAlgo = await algoRepository.save(newAlgo);

		// Création du droit d'ownership.
		const newPerm = new PermAlgorithme();
		newPerm.idUtilisateur = idUtilisateur;
		newPerm.idAlgorithme = savedAlgo.id;
		newPerm.droits = Droits.Owner;
		// Enregistrement du droit.
		const savedPerm = await permAlgoRepository.save(newPerm);
		savedAlgo.permAlgorithmes = [savedPerm];

		// Enregistrement de l'algorithme dans le système de fichiers.
		// TODO: à implémenter.

		return res
			.status(201)
			.json({ message: "Algorithme créé", algo: savedAlgo });
	}

	// PUT /:id
	// TODO: vérifier si l'utilisateur de la requête a le droit de modifier l'algorithme.
	// TODO: mettre à jour l'algorithme dans le système de fichiers.
	async updateAlgo(req: any, res: any) {
		// Récupération des données de la requette.
		const { id } = req.params;
		const { nom } = req.body;
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);

		// Récupération de l'algorithme.
		const algo = await algoRepository.findOne(id);

		if (!algo) {
			return res.status(404).json({ message: "Algorithme non trouvé" });
		}

		// Mise à jour de l'algorithme.
		algo.nom = nom;
		algo.dateModification = new Date();

		// Enregistrement de l'algorithme.
		const savedAlgo = await algoRepository.save(algo);

		return res
			.status(200)
			.json({ message: "Algorithme modifié", algo: savedAlgo });
	}

	// DELETE /:id
	// TODO: vérifier si l'utilisateur de la requête a le droit de supprimer l'algorithme.
	async deleteAlgo(req: any, res: any) {
		// Récupération des données de la requette.
		const { id } = req.params;
		const algoRepository = AppDataSource.manager.getRepository(Algorithme);

		// Récupération de l'algorithme.
		const algo = await algoRepository.findOne(id);

		if (!algo) {
			return res.status(404).json({ message: "Algorithme non trouvé" });
		}

		// Suppression de l'algorithme.
		await algoRepository.delete(algo);

		return res.status(200).json({ message: "Algorithme supprimé" });
	}
}
