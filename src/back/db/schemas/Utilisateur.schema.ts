import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	JoinColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Token } from "./Token.schema";
import { PermDossier } from "./PermDossier.schema";
import { PermAlgorithme } from "./PermAlgorithme.schema";

/**
 * Modèle de données pour les utilisateurs.
 * Un utilisateur peut avoir aucun ou plusieurs tokens.
 * Un utilisateur peut avoir aucun ou plusieurs permissions sur les dossiers.
 * Un utilisateur peut avoir aucun ou plusieurs permissions sur les algorithmes.
 * @hideconstructor
 * @category Database
 */
@Entity({ name: "utilisateur" })
export class Utilisateur {
	/**
	 * Identifiant de l'utilisateur.
	 * @public
	 * @type {number}
	 */
	@PrimaryGeneratedColumn()
	id: number;

	/**
	 * Adresse mail de l'utilisateur.
	 * @public
	 * @type {string}
	 */
	@Column({ type: "varchar", length: 255, name: "adressemail" })
	adresseMail: string;

	/**
	 * Pseudo de l'utilisateur.
	 * @public
	 * @type {string}
	 */
	@Column({ type: "varchar", length: 255 })
	pseudo: string;

	/**
	 * Mot de passe encrypté de l'utilisateur.
	 * @public
	 * @type {string}
	 */
	@Column({ type: "varchar", length: 255, name: "mdphash" })
	mdpHash: string;

	/**
	 * Date d'inscription de l'utilisateur.
	 * Date sous forme de timestamp en raison de la diversité des SGBD.
	 * @public
	 * @type {number}
	 */
	@Column({ type: "bigint", name: "dateinscription" })
	dateInscription: number;

	/**
	 * Identifiant du thème de l'utilisateur dans l'éditeur.
	 * @public
	 * @type {number}
	 * @default 0
	 */
	@Column({ type: "int", default: 0 })
	theme: number;

	/**
	 * URL de la photo de profil de l'utilisateur.
	 * @public
	 * @type {string}
	 */
	@Column({ type: "varchar", length: 255, nullable: true, name: "urlpfp" })
	urlPfp: string;

	/**
	 * Indique si l'utilisateur est vérifié sur l'application,
	 * c'est-à-dire que l'utilisateur a validé son mail.
	 * @public
	 * @type {boolean}
	 * @default false
	 */
	@Column({ type: "boolean", default: false, name: "isverified" })
	isVerified: boolean;

	/**
	 * Tokens associés à l'utilisateur.
	 * @public
	 * @type {Token[]}
	 * @see {@link Token}
	 */
	@OneToMany(() => Token, (token) => token.utilisateur)
	@JoinColumn({ name: "idutilisateur" })
	tokens: Token[];

	/**
	 * Permissions associées à l'utilisateur sur les dossiers.
	 * @public
	 * @type {PermDossier[]}
	 * @see {@link PermDossier}
	 */
	@OneToMany(() => PermDossier, (permDossier) => permDossier.utilisateur)
	permDossiers: Relation<PermDossier[]>;

	/**
	 * Permissions associées à l'utilisateur sur les algorithmes.
	 * @public
	 * @type {PermAlgorithme[]}
	 * @see {@link PermAlgorithme}
	 */
	@OneToMany(() => PermAlgorithme, (permAlgo) => permAlgo.utilisateur)
	permAlgorithmes: Relation<PermAlgorithme[]>;
}
