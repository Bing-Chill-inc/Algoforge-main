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

		// Hashage du mot de passe
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);

		// Création de l'utilisateur
		const newUser = new Utilisateur();
		newUser.adresseMail = email;
		newUser.mdpHash = hash;
		newUser.pseudo = pseudo;

		// Enregistrement de l'utilisateur
		const savedUser = await this.utilisateurRepository.save(newUser);

		// Suppression du hash du mot de passe
		savedUser.mdpHash = undefined;

		// Retour de la réponse
		return res
			.status(201)
			.json({ message: "Utilisateur créé", user: savedUser });
	}

	// POST /login
	login(req: any, res: any) {}

	// POST /verify
	verify(req: any, res: any) {}

	// POST /logout
	logout(req: any, res: any) {}

	// POST /recover
	recover(req: any, res: any) {}

	// GET /:id
	getUser(req: any, res: any) {}

	// PUT /:id
	updateUser(req: any, res: any) {}

	// DELETE /:id
	deleteUser(req: any, res: any) {}
}
