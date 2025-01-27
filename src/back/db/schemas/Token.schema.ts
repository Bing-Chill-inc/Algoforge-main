import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { Utilisateur } from "./Utilisateur.schema";

/**
 * Modèle de données pour les tokens.
 * Un token est une clé d'authentification à l'application qui est générée lors de la connexion.
 * Pour des mesures de sécurité, un token est valide pour une durée limitée.
 * Un token est associé à un utilisateur.
 * @hideconstructor
 * @category Database
 */
@Entity({ name: "token" })
export class Token {
	/**
	 * Valeur du token. Identifiant unique.
	 * @public
	 * @type {string}
	 */
	@PrimaryColumn({ type: "varchar", length: 255 })
	token: string;

	/**
	 * Date de création du token.
	 * Date sous forme de timestamp en raison de la diversité des SGBD.
	 * @public
	 * @type {number}
	 */
	@Column({ type: "bigint", name: "datecreation" })
	dateCreation: number;

	/**
	 * Date d'expiration du token.
	 * Date sous forme de timestamp en raison de la diversité des SGBD.
	 * @public
	 * @type {number}
	 */
	@Column({ type: "bigint", name: "dateexpiration" })
	dateExpiration: number;

	/**
	 * Utilisateur associé au token.
	 * @public
	 * @type {Utilisateur}
	 * @see {@link Utilisateur}
	 */
	@ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.tokens)
	utilisateur: Relation<Utilisateur>;
}
