import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToOne,
} from "typeorm";
import type { Relation } from "typeorm";
import { Dossier } from "./Dossier.schema";
import { PermAlgorithme } from "./PermAlgorithme.schema";

@Entity()
export class Algorithme {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", length: 255, default: "Nouvel algorithme" })
	nom: string;

	@Column({ type: "date" })
	dateCreation: Date;

	@Column({ type: "date" })
	dateModification: Date;

	@ManyToOne(() => Dossier, (dossier) => dossier.algos)
	dossier: Relation<Dossier>;

	@OneToMany(() => PermAlgorithme, (permAlgo) => permAlgo.idAlgorithme)
	permAlgorithmes: Relation<PermAlgorithme[]>;
}
