import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	OneToOne,
} from "typeorm";
import type { Relation } from "typeorm";
import { PermDossier } from "./PermDossier.schema";
import { Algorithme } from "./Algorithme.schema";

/**
 * Modèle de données pour les dossiers.
 * Un dossier peut contenir aucun ou plusieurs algorithmes.
 * Un dossier peut être associé à un ou plusieurs permissions.
 * @hideconstructor
 * @category Database
 */
@Entity()
export class Dossier {
	/**
	 * Identifiant du dossier.
	 * @public
	 * @type {number}
	 */
	@PrimaryGeneratedColumn()
	id: number;

	/**
	 * Nom du dossier.
	 * @public
	 * @type {string}
	 * @default "Nouveau dossier"
	 */
	@Column({ type: "varchar", length: 255, default: "Nouveau dossier" })
	nom: string;

	/**
	 * Dossier parent.
	 * Si null, le dossier est à la racine.
	 * @public
	 * @type {Dossier}
	 */
	@OneToOne(() => Dossier, (dossier) => dossier.id)
	idParent: Dossier;

	/**
	 * Date de création du dossier.
	 * @public
	 * @type {Date}
	 */
	@Column({ type: "datetime" })
	dateCreation: Date;

	/**
	 * Date de modification du dossier.
	 * @public
	 * @type {Date}
	 */
	@Column({ type: "datetime" })
	dateModification: Date;

	/**
	 * Algorithmes contenus dans le dossier.
	 * @public
	 * @type {Algorithme[]}
	 * @see {@link Algorithme}
	 */
	@OneToMany(() => Algorithme, (algo) => algo.dossier)
	algos: Algorithme[];

	/**
	 * Permissions associées au dossier.
	 * @public
	 * @type {PermDossier[]}
	 * @see {@link PermDossier}
	 */
	@OneToMany(() => PermDossier, (permDossier) => permDossier.dossier)
	permDossiers: Relation<PermDossier[]>;
}
