import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Utilisateur } from "./Utilisateur.schema";
import { Dossier } from "./Dossier.schema";

/**
 * Modèle de données pour les permissions des dossiers.
 * Un utilisateur précis peut avoir des droits sur un dossier.
 * La liste des droits disponibles est définie dans l'énumérateur {@link Droits}.
 * @hideconstructor
 * @category Database
 */
@Entity({ name: "permdossier" })
export class PermDossier {
	/**
	 * Identifiant de l'utilisateur.
	 * @public
	 * @type {number}
	 */
	@PrimaryColumn({ type: "int", name: "idutilisateur" })
	idUtilisateur: number;

	/**
	 * Identifiant du dossier.
	 * @public
	 * @type {number}
	 */
	@PrimaryColumn({ type: "int", name: "iddossier" })
	idDossier: number;

	/**
	 * Droits de l'utilisateur sur le dossier.
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
	@ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.permDossiers)
	@JoinColumn({ name: "idutilisateur" })
	utilisateur: Relation<Utilisateur>;

	/**
	 * Dossier sur lequel les droits sont appliqués.
	 * @public
	 * @type {Dossier}
	 * @see {@link Dossier}
	 */
	@ManyToOne(() => Dossier, (dossier) => dossier.permDossiers)
	@JoinColumn({ name: "iddossier" })
	dossier: Relation<Dossier>;
}
