import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Utilisateur } from "./Utilisateur.schema";
import { Dossier } from "./Dossier.schema";

@Entity()
export class PermDossier {
	@PrimaryColumn({ type: "int", name: "idUtilisateur" })
	idUtilisateur: number;

	@PrimaryColumn({ type: "int", name: "idDossier" })
	idDossier: number;

	@Column({ type: "varchar", length: 255 })
	droits: string;

	@ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.permDossiers)
	@JoinColumn({ name: "idUtilisateur" })
	utilisateur: Relation<Utilisateur>;
	@ManyToOne(() => Dossier, (dossier) => dossier.permDossiers)
	@JoinColumn({ name: "idDossier" })
	dossier: Relation<Dossier>;
}
