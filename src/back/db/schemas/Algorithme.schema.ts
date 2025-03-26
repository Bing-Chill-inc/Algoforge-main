import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Dossier } from "./Dossier.schema";
import { PermAlgorithme } from "./PermAlgorithme.schema";

// TODO: stocker le hash de l'algorithme pour réaliser des comparaisons.
/**
 * Modèle de données pour les algorithmes.
 * Un algorithme peut être associé à un dossier.
 * Un algorithme peut être associé à un ou plusieurs permissions.
 * @hideconstructor
 * @category Database
 */
@Entity({ name: "algorithme" })
export class Algorithme {
	/**
	 * Identifiant de l'algorithme.
	 * @public
	 * @type {number}
	 */
	@PrimaryGeneratedColumn()
	id: number;

	/**
	 * Nom de l'algorithme.
	 * @public
	 * @type {string}
	 * @default "Nouvel algorithme"
	 */
	@Column({ type: "varchar", length: 255, default: "Nouvel algorithme" })
	nom: string;

	/**
	 * Date de création de l'algorithme.
	 * Date sous forme de timestamp en raison de la diversité des SGBD.
	 * @public
	 * @type {number}
	 */
	@Column({ type: "bigint", name: "datecreation" })
	dateCreation: number;

	/**
	 * Date de modification de l'algorithme.
	 * Date sous forme de timestamp en raison de la diversité des SGBD.
	 * @public
	 * @type {number}
	 */
	@Column({ type: "bigint", name: "datemodification" })
	dateModification: number;

	/**
	 * Dossier dans lequel se trouve l'algorithme.
	 * Si null, l'algorithme est à la racine.
	 * @public
	 * @type {Dossier}
	 */
	@Column({ type: "int", nullable: true, name: "iddossier" })
	idDossier: number;
	@ManyToOne(() => Dossier, (dossier) => dossier.algos)
	@JoinColumn({ name: "iddossier" })
	dossier: Relation<Dossier>;

	/**
	 * Liste des permissions associés à l'algorithme.
	 * @public
	 * @type {Algorithme[]}
	 */
	@OneToMany(() => PermAlgorithme, (permAlgo) => permAlgo.algorithme)
	@JoinColumn({ name: "id", referencedColumnName: "idalgorithme" })
	permAlgorithmes: Relation<PermAlgorithme[]>;
}
