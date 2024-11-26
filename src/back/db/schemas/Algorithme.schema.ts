import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { PermAlgorithme } from "./PermAlgorithme.schema";

@Entity()
export class Algorithme {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", length: 255 })
	nom: string;

	@Column({ type: "date" })
	dateCreation: Date;

	@Column({ type: "date" })
	dateModification: Date;

	@OneToMany(() => PermAlgorithme, permAlgo => permAlgo.idAlgorithme)
    permAlgorithmes: Relation<PermAlgorithme[]>;
}
