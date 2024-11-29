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

	@Column({ type: "date" })
	dateCreation: Date;

	@Column({ type: "date" })
	dateModification: Date;

	@OneToMany(() => PermDossier, (permDossier) => permDossier.idDossier)
	permDossiers: Relation<PermDossier[]>;
}
