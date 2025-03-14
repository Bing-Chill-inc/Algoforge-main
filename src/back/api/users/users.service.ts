import { Repository } from "typeorm";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { Token } from "../../db/schemas/Token.schema";
import { AppDataSource } from "../../db/data-source";
import { UserLoginDTO, UserRegisterDTO, UserUpdateDTO } from "./users.dto";
import {
	BadRequestRes,
	CreatedRes,
	ForbiddenRes,
	InternalServerErrorRes,
	NotFoundRes,
	OkRes,
	Res,
	UnauthorizedRes,
} from "../../types/response.entity";
import { createMailToken } from "../../utils/mailConfirmToken";
import { validateClass } from "../../utils/classValidator";
import { Logger } from "../../utils/logger";

import bcrypt from "bcrypt-nodejs";
import { Dossier } from "../../db/schemas/Dossier.schema";
import { Algorithme } from "../../db/schemas/Algorithme.schema";
import { Droits } from "../../types/droits.enum";
import { PermDossier } from "../../db/schemas/PermDossier.schema";
import { PermAlgorithme } from "../../db/schemas/PermAlgorithme.schema";
import { AlgosService } from "../algos/algos.service";
import { MailService } from "../../mail/mail.service";
import { Responses } from "../../constants/responses.const";
import { hashString } from "../../utils/hash";
import { fetch } from "bun";

/**
 * Service pour les utilisateurs.
 * @hideconstructor
 * @category Services
 * @category Utilisateurs
 */
export class UsersService {
	utilisateursRepository: Repository<Utilisateur> =
		AppDataSource.getRepository(Utilisateur);
	tokensRepository: Repository<Token> = AppDataSource.getRepository(Token);
	algorithmesRepository: Repository<Algorithme> =
		AppDataSource.getRepository(Algorithme);
	dossiersRepository: Repository<Dossier> =
		AppDataSource.getRepository(Dossier);
	permsDossierRepository: Repository<PermDossier> =
		AppDataSource.getRepository(PermDossier);
	permsAlgorithmesRepository: Repository<PermAlgorithme> =
		AppDataSource.getRepository(PermAlgorithme);

	algoService: AlgosService = new AlgosService();
	mailService: MailService = new MailService();

	// POST /register
	/** Création et enregistrement d'un nouvel utilisateur, utilisé lors de son inscription.
	 *
	 * @param data Données de l'utilisateur à créer.
	 * @returns Réponse de la création de l'utilisateur.
	 */
	async register(data: UserRegisterDTO) {
		// Vérification de la présence des données
		if (!data.email || !data.password || !data.pseudo) {
			return new BadRequestRes(Responses.General.Missing_data);
		}
		const validationErrors = await validateClass(data);
		if (validationErrors) {
			return new BadRequestRes(
				Responses.General.Invalid_data,
				validationErrors,
			);
		}

		// Vérification de l'unicité de l'email, requête à la DB avec TypeORM
		const userMails = await this.utilisateursRepository.find({
			select: { adresseMail: true },
		});

		if (userMails.some((user) => user.adresseMail === data.email)) {
			return new Res(409, Responses.User.Email_already_exists);
		}

		// Hashage du mot de passe
		const hash = hashString(data.password);

		// Création de l'utilisateur
		const newUser = new Utilisateur();
		newUser.adresseMail = data.email;
		newUser.mdpHash = hash;
		newUser.pseudo = data.pseudo;
		newUser.dateInscription = new Date().getTime();

		// Enregistrement de l'utilisateur
		const savedUser = await this.utilisateursRepository.save(newUser);

		// Gestions des erreurs
		if (!savedUser) {
			return new InternalServerErrorRes(
				Responses.User.Errors.While_creating_user,
			);
		}

		// Génération du token de confirmation
		const mailToken = await createMailToken(savedUser.id);

		if (!mailToken) {
			return new InternalServerErrorRes(
				Responses.Token.Errors.While_creating_token,
			);
		}

		// Envoi du mail de confirmation
		Logger.debug(
			`Mail de confirmation (token): ${mailToken}`,
			"UsersService",
			2,
		);
		try {
			await this.mailService.sendConfirmationMail(
				savedUser.adresseMail,
				savedUser,
				mailToken,
			);
		} catch (err) {
			// Suppression de l'utilisateur en cas d'erreur
			await this.utilisateursRepository.delete(savedUser.id);

			return new Res(
				500,
				"Erreur lors de l'envoi du mail de confirmation",
			);
		}

		// Suppression du hash du mot de passe
		savedUser.mdpHash = undefined;

		// Retour de la réponse
		return new CreatedRes(Responses.User.Success.Created, savedUser);
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
			return new BadRequestRes(Responses.Token.Invalid);
		}

		// On récupère l'utilisateur dans la DB
		const user = (await this.getUser(parseInt(id))).data as Utilisateur;

		// Vérification de l'utilisateur (s'il existe et s'il n'est pas déjà vérifié)
		if (!user || user.isVerified) {
			return new NotFoundRes(
				Responses.User.Not_found_or_already_verified,
			);
		}

		// Vérification de la date d'inscription
		if (user.dateInscription.toString() !== dateInscription) {
			return new BadRequestRes(Responses.Token.Invalid);
		}

		// Mise à jour du statut "vérfié" de l'utilisateur
		user.isVerified = true;

		// Enregistrement de l'utilisateur
		if (!(await this.utilisateursRepository.save(user))) {
			return new InternalServerErrorRes(
				Responses.User.Errors.While_confirming_user,
			);
		}

		return new OkRes(Responses.User.Success.Confirmed);
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
			return new BadRequestRes(Responses.General.Missing_data);
		}
		const validationErrors = await validateClass(data);
		if (validationErrors) {
			return new BadRequestRes(
				Responses.General.Invalid_data,
				validationErrors,
			);
		}

		// Recherche de l'utilisateur dans la DB
		const user = await this.utilisateursRepository.findOne({
			where: { adresseMail: data.email },
		});

		if (!user) {
			return new NotFoundRes(Responses.User.Not_found);
		}

		// Vérification du mot de passe
		if (!bcrypt.compareSync(data.password, user.mdpHash)) {
			return new UnauthorizedRes(Responses.User.Invalid_password);
		}
		// Vérification de l'utilisateur
		if (!user.isVerified) {
			return new UnauthorizedRes(Responses.User.Not_verified);
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
		return new OkRes(Responses.Auth.Success.Logged_in, user);
	}

	// GET /logout
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
			return new NotFoundRes(Responses.Token.Not_found);
		}

		return new OkRes(Responses.Auth.Success.Logged_out);
	}

	// POST /recover
	/** Récupération du mot de passe par mail, utilisé lors de la récupération du mot de passe.
	 *
	 * @param email Email de l'utilisateur à récupérer.
	 * @returns Réponse de la récupération du mot de passe.
	 */
	recover(email: string) {
		// TODO: Récupération du mot de passe par mail (envoi d'un mail de récupération)

		return new OkRes("Mail de récupération envoyé");
	}

	// GET /:id
	/** Récupération des informations de l'utilisateur, utilisé lors de la consultation de son profil.
	 *
	 * @param id Id de l'utilisateur à récupérer.
	 * @returns Réponse de la récupération de l'utilisateur.
	 */
	async getUser(id: number) {
		// Récupération de l'utilisateur dans la DB
		const user = await this.utilisateursRepository.findOne({
			where: { id: id },
		});

		if (!user) {
			return new NotFoundRes(Responses.User.Not_found);
		}

		// Suppression du hash du mot de passe avant renvoi
		user.mdpHash = undefined;

		// Retour de la réponse
		return new OkRes(Responses.User.Success.Found, user);
	}

	// PUT /:id
	async updateUser(id: number, data: UserUpdateDTO) {
		// Vérification des droits de l'utilisateur.
		if (data.requestedUserId !== id) {
			return new ForbiddenRes(Responses.General.Forbidden);
		}

		// Vérification de la présence des données
		if (!data.currentPassword) {
			return new BadRequestRes(Responses.General.Missing_data);
		}
		if (!data.pseudo && !data.urlPfp && !data.newPassword) {
			return new BadRequestRes(Responses.General.Missing_data);
		}

		const validationErrors = await validateClass(data);
		if (validationErrors) {
			return new BadRequestRes(
				Responses.General.Invalid_data,
				validationErrors,
			);
		}

		// Récupération de l'utilisateur dans la DB
		const user = await this.utilisateursRepository.findOne({
			where: { id: id },
		});

		if (!user) {
			return new NotFoundRes(Responses.User.Not_found);
		} else if (!bcrypt.compareSync(data.currentPassword, user.mdpHash)) {
			return new UnauthorizedRes(Responses.User.Invalid_password);
		}

		// Mise à jour de l'utilisateur
		if (data.pseudo) {
			user.pseudo = data.pseudo;
		}
		if (data.newPassword) {
			user.mdpHash = hashString(data.newPassword);
		}
		if (data.urlPfp) {
			const requestUrl = await fetch(data.urlPfp);
			if (
				!requestUrl.ok ||
				!requestUrl.headers?.get("content-type")?.includes("image")
			) {
				return new BadRequestRes(Responses.User.Invalid_profile_url);
			}
			user.urlPfp = data.urlPfp;
		}

		// Enregistrement de l'utilisateur
		const savedUser = await this.utilisateursRepository.save(user);

		// Suppression du hash du mot de passe
		savedUser.mdpHash = undefined;

		// Retour de la réponse
		return new OkRes(Responses.User.Success.Updated, savedUser);
	}

	// DELETE /:id
	async deleteUser(id: number, requestedUserId: number) {
		// Récupération de l'utilisateur dans la DB
		const user = await this.utilisateursRepository.findOne({
			where: { id: id },
			relations: {
				permAlgorithmes: true,
				permDossiers: true,
				tokens: true,
			},
		});

		if (!user) {
			return new NotFoundRes(Responses.User.Not_found);
		} else if (user.id !== requestedUserId) {
			return new ForbiddenRes(Responses.General.Forbidden);
		}

		// // Suppression des tokens de l'utilisateur.
		for (const token of user.tokens) {
			await this.tokensRepository.delete(token.token);
		}
		// Suppression des dossiers et des permissions associées de l'utilisateur.
		for (const permDossier of user.permDossiers) {
			if (
				permDossier.droits.length > 0 &&
				permDossier.droits === Droits.Owner
			) {
				// TODO: utiliser le service de dossier pour supprimer le dossier (prochaine maj).
				await this.dossiersRepository.delete(permDossier.idDossier);
			} else {
				await this.permsDossierRepository.delete(permDossier);
			}
		}
		// Suppression des algorithmes et des permissions associées de l'utilisateur.
		for (const permAlgo of user.permAlgorithmes) {
			if (
				permAlgo.droits.length > 0 &&
				permAlgo.droits === Droits.Owner
			) {
				await this.algoService.deleteAlgo(
					permAlgo.idAlgorithme,
					user.id,
				);
			} else {
				await this.permsAlgorithmesRepository.delete(permAlgo);
			}
		}
		// Suppression de l'utilisateur.
		const deletedUser = await this.utilisateursRepository.delete(user.id);

		return new OkRes(Responses.User.Success.Deleted, deletedUser);
	}

	/**
	 * Vérification de la validité du token.
	 * @param token Token à vérifier.
	 * @returns Réponse de la vérification du token.
	 * @example
	 * // Retours possibles :
	 * { status: 400, message: "Token manquant" }
	 * { status: 401, message: "Token invalide" }
	 * { status: 401, message: "Utilisateur non vérifié" }
	 * { status: 401, message: "Token expiré" }
	 * { status: 200, message: "Token valide", data: Token }
	 */
	async verify(token: string) {
		if (!token) return new BadRequestRes(Responses.Token.Missing);

		// On compare le token avec la DB
		const tokenDB = await this.tokensRepository.findOne({
			where: { token: token },
			relations: { utilisateur: true },
		});

		if (!tokenDB) {
			return new UnauthorizedRes(Responses.Token.Invalid);
		} else if (
			this.mailService.active &&
			tokenDB.utilisateur.isVerified === false
		) {
			return new UnauthorizedRes(Responses.User.Not_verified);
		} else if (tokenDB.dateExpiration < new Date().getTime()) {
			// Suppression du token expiré
			await this.tokensRepository.delete(tokenDB.token);

			return new UnauthorizedRes(Responses.Token.Expired);
		} else {
			// Prolongation de la date d'expiration de 48h
			tokenDB.dateExpiration = new Date(
				Date.now() + 48 * 60 * 60 * 1000,
			).getTime();
			await this.tokensRepository.save(tokenDB);

			tokenDB.utilisateur.mdpHash = undefined;

			return new OkRes(Responses.Token.Valid, tokenDB);
		}
	}

	/** Récupération de l'utilisateur par son email.
	 *
	 * @param email Email de l'utilisateur à récupérer.
	 * @returns Utilisateur trouvé.
	 */
	async getUserByEmail(email: string) {
		// Récupération de l'utilisateur dans la DB
		const user = await this.utilisateursRepository.findOne({
			where: { adresseMail: email },
		});

		if (!user) {
			return new NotFoundRes(Responses.User.Not_found);
		}

		user.mdpHash = undefined;

		return new OkRes(Responses.User.Success.Found, user);
	}
}
