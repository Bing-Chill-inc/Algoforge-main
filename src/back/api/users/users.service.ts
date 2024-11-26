import { Repository } from "typeorm";
import { Utilisateur } from "../../db/schemas/Utilisateur.schema";
import { AppDataSource } from "../../db/data-source";

export class UsersService {
    utilisateurRepository: Repository<Utilisateur> = AppDataSource.getRepository(Utilisateur);

    constructor() {

    }

    // POST /register
    /** Création et enregistrement d'un nouvel utilisateur, utilisé lors de son inscription.
     * 
     * @param req Requête HTTP
     * @param res Résultat de la requête
     */
    async register(req: any, res: any) {
        // Récupération des données de l'utilisateur
        const { email, password, username } = req.body;

        // Vérification de la présence des données
        if (!email || !password || !username) {
            return res.status(400).json({ message: "Il manque des données" });
        }

        // Vérification de l'unicité de l'email, requête à la DB avec TypeORM
        const userMails = await this.utilisateurRepository.find({ select: { adresseMail: true }, });

        if (userMails.some((user) => user.adresseMail === email)) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }
        // Vérification de l'unicité du nom d'utilisateur
        // Création de l'utilisateur
        // Enregistrement de l'utilisateur
        // Envoi d'un email de vérification
        // Retour de la réponse
    };

    // POST /login
    login(req: any, res: any) {

    };

    // POST /verify
    verify(req: any, res: any) {

    };

    // POST /logout
    logout(req: any, res: any) {

    };

    // POST /recover
    recover(req: any, res: any) {

    };

    // GET /:id
    getUser(req: any, res: any) {

    };

    // PUT /:id
    updateUser(req: any, res: any) {

    };

    // DELETE /:id
    deleteUser(req: any, res: any) {

    };
}