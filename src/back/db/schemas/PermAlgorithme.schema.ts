import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Utilisateur } from "./Utilisateur.schema";
import { Algorithme } from "./Algorithme.schema";

/**
 * Modèle de données pour les permissions des algorithmes.
 * Un utilisateur précis peut avoir des droits sur un algorithme.
 * La liste des droits disponibles est définie dans l'énumérateur {@link Droits}.
 * @hideconstructor
 * @category Database
 */
@Entity({ name: "permalgorithme" })
export class PermAlgorithme {
	/**
	 * Identifiant de l'utilisateur.
	 * @public
	 * @type {number}
	 */
	@PrimaryColumn({ type: "int", name: "idutilisateur" })
	idUtilisateur: number;

	/**
	 * Identifiant de l'algorithme.
	 * @public
	 * @type {number}
	 */
	@PrimaryColumn({ type: "int", name: "idalgorithme" })
	idAlgorithme: number;

	/**
	 * Droits de l'utilisateur sur l'algorithme.
	 * @public
	 * @type {string}
	 * @see {@link Droits}
	 */
	@Column({ type: "varchar", length: 255 })
	droits: string;

	/**
	 * Utilisateur ayant les droits.
	 * @public
	 * @type {Utilisateur}
	 * @see {@link Utilisateur}
	 */
	@ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.permAlgorithmes)
	@JoinColumn({ name: "idutilisateur" })
	utilisateur: Relation<Utilisateur>;

	/**
	 * Algorithme sur lequel les droits sont appliqués.
	 * @public
	 * @type {Algorithme}
	 * @see {@link Algorithme}
	 */
	@ManyToOne(() => Algorithme, (algorithme) => algorithme.permAlgorithmes)
	@JoinColumn({ name: "idalgorithme" })
	algorithme: Relation<Algorithme>;
}
