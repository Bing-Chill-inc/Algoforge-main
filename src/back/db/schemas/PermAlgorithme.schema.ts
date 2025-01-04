import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Utilisateur } from "./Utilisateur.schema";
import { Algorithme } from "./Algorithme.schema";

@Entity()
export class PermAlgorithme {
	@PrimaryColumn({ type: "int", name: "idUtilisateur" })
	idUtilisateur: number;

	@PrimaryColumn({ type: "int", name: "idAlgorithme" })
	idAlgorithme: number;

	@Column({ type: "varchar", length: 255 })
	droits: string;

	@ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.permAlgorithmes)
	@JoinColumn({ name: "idUtilisateur" })
	utilisateur: Relation<Utilisateur>;
	@ManyToOne(() => Algorithme, (algorithme) => algorithme.permAlgorithmes)
	@JoinColumn({ name: "idAlgorithme" })
	algorithme: Relation<Algorithme>;
}
