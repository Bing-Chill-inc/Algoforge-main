import { Repository } from "typeorm";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { AppDataSource } from "../../db/data-source";
import { UserLoginDTO, UserRegisterDTO, UserUpdateDTO } from "./users.dto";
import { Res } from "../../types/response.entity";

import bcrypt from "bcrypt";

export class UsersService {
	utilisateurRepository: Repository<Utilisateur> =
		AppDataSource.getRepository(Utilisateur);

	constructor() {}

	// POST /register
	/** Création et enregistrement d'un nouvel utilisateur, utilisé lors de son inscription.
	 *
	 * @param data Données de l'utilisateur à créer.
	 * @returns Réponse de la création de l'utilisateur.
	 */
	async register(data: UserRegisterDTO) {
		// Vérification de la présence des données
		if (!data.email || !data.password || !data.pseudo) {
			return new Res(400, "Il manque des données.");
		}

		// Vérification de l'unicité de l'email, requête à la DB avec TypeORM
		const userMails = await this.utilisateurRepository.find({
			select: { adresseMail: true },
		});

		if (userMails.some((user) => user.adresseMail === data.email)) {
			return new Res(409, "Email déjà utilisé.");
		}

		// TODO: Envoi du mail de confirmation

		// Hashage du mot de passe
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(data.password, salt);

		// Création de l'utilisateur
		const newUser = new Utilisateur();
		newUser.adresseMail = data.email;
		newUser.mdpHash = hash;
		newUser.pseudo = data.pseudo;

		// Enregistrement de l'utilisateur
		let savedUser = await this.utilisateurRepository.save(newUser);

		// Suppression du hash du mot de passe
		savedUser.mdpHash = undefined;

		// Retour de la réponse
		return new Res(201, "Utilisateur créé", savedUser);
	}

	// POST /login
	/** Connexion de l'utilisateur, utilisé lors de sa connexion.
	 *
	 * @param data Données de l'utilisateur à connecter.
	 * @returns Réponse de la connexion.
	 */
	async login(data: UserLoginDTO) {
		// Vérification de la présence des données
		if (!data.email || !data.password) {
			return new Res(400, "Il manque des données");
		}

		// Recherche de l'utilisateur dans la DB
		const user = await this.utilisateurRepository.findOne({
			where: { adresseMail: data.email },
		});

		if (!user) {
			return new Res(404, "Utilisateur introuvable");
		}

		// Vérification du mot de passe
		if (!bcrypt.compareSync(data.password, user.mdpHash)) {
			return new Res(401, "Mot de passe incorrect");
		}

		// Suppression du hash du mot de passe avant renvoi
		user.mdpHash = undefined;

		// Retour de la réponse
		return new Res(200, "Connexion réussie", user);
	}

	// TODO: Générer un token JWT pour la connexion automatique --> register et login

	// POST /verify
	/** Vérification de la validité du token, utilisé pour les routes protégées.
	 *
	 * @param token Token à vérifier.
	 * @returns Réponse de la vérification du token.
	 */
	verify(token: string) {
		// TODO: Vérifier la validité du token pour les routes protégées
		return new Res(200, "Token valide");
	}

	// POST /logout
	/** Déconnexion de l'utilisateur, utilisé lors de sa déconnexion.
	 *
	 * @param token Token de l'utilisateur à déconnecter.
	 * @returns Réponse de la déconnexion.
	 */
	logout(token: string) {
		// TODO: Supprimer le token lors du lougout

		return new Res(200, "Déconnexion réussie");
	}

	// POST /recover
	/** Récupération du mot de passe par mail, utilisé lors de la récupération du mot de passe.
	 *
	 * @param email Email de l'utilisateur à récupérer.
	 * @returns Réponse de la récupération du mot de passe.
	 */
	recover(email: string) {
		// TODO: Récupération du mot de passe par mail

		return new Res(200, "Mail de récupération envoyé");
	}

	// GET /:id
	/** Récupération des informations de l'utilisateur, utilisé lors de la consultation de son profil.
	 *
	 * @param id Id de l'utilisateur à récupérer.
	 * @returns Réponse de la récupération de l'utilisateur.
	 */
	async getUser(id: number) {
		// Récupération de l'utilisateur dans la DB
		const user = await this.utilisateurRepository.findOne({
			where: { id: id },
		});

		if (!user) {
			return new Res(404, "Utilisateur introuvable");
		}

		// Suppression du hash du mot de passe avant renvoi
		user.mdpHash = undefined;

		// Retour de la réponse
		return new Res(200, "Utilisateur trouvé", user);
	}

	// PUT /:id
	async updateUser(id: number, data: UserUpdateDTO) {
		// Récupération de l'utilisateur dans la DB
		const user = await this.utilisateurRepository.findOne({
			where: { id: id },
		});

		if (!user) {
			return new Res(404, "Utilisateur introuvable");
		} else if (!bcrypt.compareSync(data.currentPassword, user.mdpHash)) {
			return new Res(401, "Mot de passe incorrect");
		}

		// Mise à jour de l'utilisateur
		if (data.email) {
			user.adresseMail = data.email;
		}

		if (data.pseudo) {
			user.pseudo = data.pseudo;
		}

		if (data.newPassword) {
			const salt = bcrypt.genSaltSync(10);
			user.mdpHash = bcrypt.hashSync(data.newPassword, salt);
		}

		// Enregistrement de l'utilisateur
		let savedUser = await this.utilisateurRepository.save(user);

		// Suppression du hash du mot de passe
		savedUser.mdpHash = undefined;

		// Retour de la réponse
		return new Res(200, "Utilisateur mis à jour", savedUser);
	}

	// DELETE /:id
	async deleteUser(id: number) {
		// Récupération de l'utilisateur dans la DB
		const user = await this.utilisateurRepository.findOne({
			where: { id: id },
		});

		if (!user) {
			return new Res(404, "Utilisateur introuvable");
		}

		// Suppression de l'utilisateur
		const deletedUser = this.utilisateurRepository.delete(user);
		// TODO: Supprimer les données de l'utilisateur (algos, ...)

		// Suppression du hash du mot de passe
		user.mdpHash = undefined;

		return new Res(200, "Utilisateur supprimé", deletedUser);
	}
}
