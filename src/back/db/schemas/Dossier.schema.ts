import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	OneToOne,
} from "typeorm";
import type { Relation } from "typeorm";
import { PermDossier } from "./PermDossier.schema";

@Entity()
export class Dossier {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", length: 255 })
	nom: string;

	@OneToOne(() => Dossier, (dossier) => dossier.id)
	idParent: Dossier;

	// NOTE: ne manquerait-il pas les dates de création et de modification ?
	// ex: Algorithme.schema.ts

	@OneToMany(() => PermDossier, (permDossier) => permDossier.idDossier)
	permDossiers: Relation<PermDossier[]>;
}
