import { Repository } from "typeorm";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { Token } from "../../db/schemas/Token.schema";
import { AppDataSource } from "../../db/data-source";
import { UserLoginDTO, UserRegisterDTO, UserUpdateDTO } from "./users.dto";
import { Res } from "../../types/response.entity";
import { createMailToken } from "../../utils/mailConfirmToken";
import { validateClass } from "../../utils/classValidator";
import { Logger } from "../../utils/logger";

import bcrypt from "bcrypt-nodejs";

/**
 * Service pour les utilisateurs.
 * @hideconstructor
 * @category Services
 * @category Utilisateurs
 */
export class UsersService {
	utilisateurRepository: Repository<Utilisateur> =
		AppDataSource.getRepository(Utilisateur);

	tokensRepository: Repository<Token> = AppDataSource.getRepository(Token);

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
			return new Res(400, "Il manque des données");
		}
		const validationErrors = await validateClass(data);
		if (validationErrors) {
			return new Res(400, "Données invalides", validationErrors);
		}

		// Vérification de l'unicité de l'email, requête à la DB avec TypeORM
		const userMails = await this.utilisateurRepository.find({
			select: { adresseMail: true },
		});

		if (userMails.some((user) => user.adresseMail === data.email)) {
			return new Res(409, "Email déjà utilisé");
		}

		// Hashage du mot de passe
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(data.password, salt);

		// Création de l'utilisateur
		const newUser = new Utilisateur();
		newUser.adresseMail = data.email;
		newUser.mdpHash = hash;
		newUser.pseudo = data.pseudo;
		newUser.dateInscription = new Date().getTime();

		// Enregistrement de l'utilisateur
		const savedUser = await this.utilisateurRepository.save(newUser);

		// Gestions des erreurs
		if (!savedUser) {
			return new Res(500, "Erreur lors de la création de l'utilisateur");
		}

		// Génération du token de confirmation
		const mailToken = await createMailToken(savedUser.id);

		if (!mailToken) {
			return new Res(
				500,
				"Erreur lors de la création du token de confirmation",
			);
		}

		// TODO: Envoi du mail de confirmation
		Logger.debug(
			`Mail de confirmation (token): ${mailToken}`,
			"UsersService",
			2,
		);

		// Suppression du hash du mot de passe
		savedUser.mdpHash = undefined;

		// Retour de la réponse
		return new Res(201, "Utilisateur créé", savedUser);
	}

	// POST /confirm
	/** Confirmation de l'inscription de l'utilisateur.
	 *
	 * @param mailToken Token de l'utilisateur à confirmer.
	 * @returns Réponse de la confirmation de l'inscription.
	 */
	async confirm(mailToken: string) {
		// Récupérer l'id de l'utilisateur à partir du token (déchiffrer puis split par "_")
		let id: string;
		let dateInscription: string;
		try {
			const decoded = atob(mailToken);
			id = decoded.split("_")[0];
			dateInscription = decoded.split("_")[1].slice(3);
		} catch (err) {
			return new Res(400, "Token invalide");
		}

		// On récupère l'utilisateur dans la DB
		const user = (await this.getUser(parseInt(id))).data as Utilisateur;

		// Vérification de l'utilisateur (s'il existe et s'il n'est pas déjà vérifié)
		if (!user || user.isVerified) {
			return new Res(404, "Utilisateur introuvable ou déjà vérifié");
		}

		// Vérification de la date d'inscription
		if (user.dateInscription.toString() !== dateInscription) {
			return new Res(400, "Token invalide");
		}

		// Mise à jour du statut "vérfié" de l'utilisateur
		user.isVerified = true;

		// Enregistrement de l'utilisateur
		if (!(await this.utilisateurRepository.save(user))) {
			return new Res(
				500,
				"Erreur lors de la confirmation de l'inscription",
			);
		}

		return new Res(200, "Inscription confirmée");
	}

	// POST /login
	/** Connexion de l'utilisateur.
	 *
	 * @param data Données de l'utilisateur à connecter.
	 * @returns Réponse de la connexion.
	 */
	async login(data: UserLoginDTO) {
		// Vérification de la présence des données
		if (!data.email || !data.password) {
			return new Res(400, "Il manque des données");
		}
		const validationErrors = await validateClass(data);
		if (validationErrors) {
			return new Res(400, "Données invalides", validationErrors);
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

		const token = new Token();
		token.dateCreation = new Date().getTime();
		token.dateExpiration = new Date(
			Date.now() + 48 * 60 * 60 * 1000,
		).getTime();
		token.utilisateur = user;

		// Générer un token unique
		token.token = bcrypt.hashSync(
			`${user.id}_${token.dateCreation}_${crypto.randomUUID()}`,
			bcrypt.genSaltSync(10),
		);

		// Enregistrement du token dans la DB
		const savedToken = await this.tokensRepository.save(token);
		savedToken.utilisateur = undefined;
		user.tokens = [savedToken];

		// Retour de la réponse
		return new Res(200, "Connexion réussie", user);
	}

	// POST /logout
	/** Déconnexion de l'utilisateur, utilisé lors de sa déconnexion.
	 *
	 * @param token Token de l'utilisateur à déconnecter.
	 * @returns Réponse de la déconnexion.
	 */
	async logout(token: string) {
		// Suppression du token dans la DB
		const deletedToken = await this.tokensRepository.delete({
			token: token,
		});

		if (deletedToken.affected <= 0) {
			return new Res(404, "Token introuvable");
		}

		return new Res(200, "Déconnexion réussie");
	}

	// POST /recover
	/** Récupération du mot de passe par mail, utilisé lors de la récupération du mot de passe.
	 *
	 * @param email Email de l'utilisateur à récupérer.
	 * @returns Réponse de la récupération du mot de passe.
	 */
	recover(email: string) {
		// TODO: Récupération du mot de passe par mail (envoi d'un mail de récupération)

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
		// Vérification des droits de l'utilisateur.
		if (data.requestedUserId !== id) {
			return new Res(403, "Permission refusée");
		}

		// Vérification de la présence des données
		if (!data.currentPassword) {
			return new Res(400, "Il manque des données");
		}

		const validationErrors = await validateClass(data);
		if (validationErrors) {
			return new Res(400, "Données invalides", validationErrors);
		}

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
		} else if (data.pseudo) {
			user.pseudo = data.pseudo;
		} else if (data.newPassword) {
			const salt = bcrypt.genSaltSync(10);
			user.mdpHash = bcrypt.hashSync(data.newPassword, salt);
		} else {
			return new Res(400, "Il manque des données");
		}

		// Enregistrement de l'utilisateur
		const savedUser = await this.utilisateurRepository.save(user);

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
		await this.utilisateurRepository.delete(user.id);
		// TODO: Supprimer les données de l'utilisateur (algos, ...)

		return new Res(200, "Utilisateur supprimé");
	}

	/** Vérification de la validité du token.
	 *
	 * @param token Token à vérifier.
	 * @returns Réponse de la vérification du token.
	 */
	async verify(token: string) {
		if (!token) return new Res(400, "Token manquant");

		// On compare le token avec la DB
		const tokenDB = await this.tokensRepository.findOne({
			where: { token: token },
			relations: { utilisateur: true },
		});

		if (!tokenDB) {
			return new Res(401, "Token invalide");
		} else if (tokenDB.utilisateur.isVerified === false) {
			return new Res(401, "Utilisateur non vérifié");
		} else if (tokenDB.dateExpiration < new Date().getTime()) {
			// Suppression du token expiré
			await this.tokensRepository.delete(tokenDB.token);

			return new Res(401, "Token expiré");
		} else {
			// Prolongation de la date d'expiration de 48h
			tokenDB.dateExpiration = new Date(
				Date.now() + 48 * 60 * 60 * 1000,
			).getTime();
			await this.tokensRepository.save(tokenDB);

			tokenDB.utilisateur.mdpHash = undefined;

			return new Res(200, "Token valide", tokenDB);
		}
	}

	/** Récupération de l'utilisateur par son email.
	 *
	 * @param email Email de l'utilisateur à récupérer.
	 * @returns Utilisateur trouvé.
	 */
	async getUserByEmail(email: string) {
		// Récupération de l'utilisateur dans la DB
		const user = await this.utilisateurRepository.findOne({
			where: { adresseMail: email },
		});

		if (!user) {
			return new Res(404, "Utilisateur introuvable");
		}

		user.mdpHash = undefined;

		return new Res(200, "Utilisateur trouvé", user);
	}
}
