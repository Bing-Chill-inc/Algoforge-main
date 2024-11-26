import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { Utilisateur } from "./Utilisateur.schema";
import { Algorithme } from "./Algorithme.schema";
import { Dossier } from "./Dossier.schema";

@Entity()
export class PermAlgorithme {
	@PrimaryColumn({ type: "int" })
	idUtilisateur: number;

	@PrimaryColumn({ type: "int" })
	idAlgorithme: number;

	@Column({ type: "varchar", length: 255 })
	droits: string;

	@ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.permAlgorithmes)
	utilisateur: Relation<Utilisateur>;
	@ManyToOne(() => Algorithme, (algorithme) => algorithme.permAlgorithmes)
	algorithme: Relation<Algorithme>;
}
