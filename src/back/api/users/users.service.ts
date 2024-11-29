import { Repository } from "typeorm";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { AppDataSource } from "../../db/data-source";

import bcrypt from "bcrypt";

export class UsersService {
	utilisateurRepository: Repository<Utilisateur> =
		AppDataSource.getRepository(Utilisateur);

	constructor() {}

	// POST /register
	/** Création et enregistrement d'un nouvel utilisateur, utilisé lors de son inscription.
	 *
	 * @param req Requête HTTP
	 * @param res Résultat de la requête
	 */
	async register(req: any, res: any) {
		// Récupération des données de l'utilisateur
		const { email, password, pseudo } = req.body;

		// Vérification de la présence des données
		if (!email || !password || !pseudo) {
			return res.status(400).json({ message: "Il manque des données" });
		}

		// Vérification de l'unicité de l'email, requête à la DB avec TypeORM
		const userMails = await this.utilisateurRepository.find({
			select: { adresseMail: true },
		});

		if (userMails.some((user) => user.adresseMail === email)) {
			return res
				.status(400)
				.json({ message: "Cet email est déjà utilisé" });
		}

		// TODO: Envoi du mail de confirmation

		// Hashage du mot de passe
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);

		// Création de l'utilisateur
		const newUser = new Utilisateur();
		newUser.adresseMail = email;
		newUser.mdpHash = hash;
		newUser.pseudo = pseudo;

		let savedUser: Utilisateur;

		// Enregistrement de l'utilisateur
		await this.utilisateurRepository.save(newUser).then((user) => {
			savedUser = user;
		});

		// Suppression du hash du mot de passe
		savedUser.mdpHash = undefined;

		// Retour de la réponse
		return res
			.status(201)
			.json({ message: "Utilisateur créé", user: savedUser });
	}

	// POST /login
	login(req: any, res: any) {
		// Récupération des données de l'utilisateur
		const { email, password } = req.body;

		// Vérification de la présence des données
		if (!email || !password) {
			return res.status(400).json({ message: "Il manque des données" });
		}

		// Recherche de l'utilisateur dans la DB
		this.utilisateurRepository
			.findOne({ select: { adresseMail: email } })
			.then((user) => {
				if (!user) {
					return res
						.status(404)
						.json({ message: "Utilisateur introuvable" });
				}

				// Vérification du mot de passe
				if (!bcrypt.compareSync(password, user.mdpHash)) {
					return res
						.status(401)
						.json({ message: "Mot de passe incorrect" });
				}

				// Suppression du hash du mot de passe
				user.mdpHash = undefined;

				// Retour de la réponse
				return res
					.status(200)
					.json({ message: "Connexion réussie", user: user });
			})
			.catch((error) => {
				return res
					.status(500)
					.json({ message: "Erreur serveur", error });
			});
	}

	// TODO: Générer un token JWT pour la connexion automatique --> register et login

	// POST /verify
	verify(req: any, res: any) {
		// TODO: Vérifier la validité du token pour les routes protégées
	}

	// POST /logout
	logout(req: any, res: any) {
		// TODO: Supprimer le token lors du lougout

		return res.status(200).json({ message: "Déconnexion réussie" });
	}

	// POST /recover
	recover(req: any, res: any) {
		// TODO: Récupération du mot de passe par mail
	}

	// GET /:id
	getUser(req: any, res: any) {
		// Récupération de l'id de l'utilisateur
		const id = req.params.id;

		// Recherche de l'utilisateur dans la DB
		this.utilisateurRepository
			.findOne({ select: { id: id } })
			.then((user) => {
				if (!user) {
					return res
						.status(404)
						.json({ message: "Utilisateur introuvable" });
				}

				// Retour de la réponse
				return res
					.status(200)
					.json({ message: "Utilisateur trouvé", user: user });
			})
			.catch((error) => {
				return res
					.status(500)
					.json({ message: "Erreur serveur", error });
			});
	}

	// PUT /:id
	updateUser(req: any, res: any) {
		// Récupération de l'id de l'utilisateur
		const id = req.params.id;

		// Récupération des données de l'utilisateur
		const { email, password, pseudo, theme } = req.body;

		// Recherche de l'utilisateur dans la DB
		this.utilisateurRepository
			.findOne({ select: { id: id } })
			.then((user) => {
				if (!user) {
					return res
						.status(404)
						.json({ message: "Utilisateur introuvable" });
				}

				// Modification des données de l'utilisateur
				if (email) user.adresseMail = email;
				if (password) {
					// Hashage du mot de passe
					const salt = bcrypt.genSaltSync(10);
					const hash = bcrypt.hashSync(password, salt);
					user.mdpHash = hash;
				}
				if (pseudo) user.pseudo = pseudo;
				if (theme) user.theme = theme;

				let updatedUser: Utilisateur;

				// Enregistrement des modifications
				this.utilisateurRepository.save(user).then((user) => {
					updatedUser = user;
				});

				// Suppression du hash du mot de passe
				updatedUser.mdpHash = undefined;

				// Retour de la réponse
				return res.status(200).json({
					message: "Utilisateur modifié",
					user: updatedUser,
				});
			})
			.catch((error) => {
				return res
					.status(500)
					.json({ message: "Erreur serveur", error });
			});
	}

	// DELETE /:id
	deleteUser(req: any, res: any) {
		// Récupération de l'id de l'utilisateur
		const id = req.params.id;

		// Recherche de l'utilisateur dans la DB
		this.utilisateurRepository
			.findOne({ select: { id: id } })
			.then((user) => {
				if (!user) {
					return res
						.status(404)
						.json({ message: "Utilisateur introuvable" });
				}

				// Suppression de l'utilisateur
				this.utilisateurRepository.delete(user);

				// Retour de la réponse
				return res
					.status(200)
					.json({ message: "Utilisateur supprimé" });
			})
			.catch((error) => {
				return res
					.status(500)
					.json({ message: "Erreur serveur", error });
			});
	}
}
