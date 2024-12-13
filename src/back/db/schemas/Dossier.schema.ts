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

@Entity()
export class Dossier {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", length: 255, default: "Nouveau dossier" })
	nom: string;

	@OneToOne(() => Dossier, (dossier) => dossier.id)
	idParent: Dossier;

	@Column({ type: "date" })
	dateCreation: Date;

	@Column({ type: "date" })
	dateModification: Date;

	@OneToMany(() => Algorithme, (algo) => algo.dossier)
	algos: Algorithme[];

	@OneToMany(() => PermDossier, (permDossier) => permDossier.idDossier)
	permDossiers: Relation<PermDossier[]>;
}
