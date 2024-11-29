import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { Utilisateur } from "./Utilisateur.schema";
import { Dossier } from "./Dossier.schema";

@Entity()
export class PermDossier {
	@PrimaryColumn({ type: "int" })
	idUtilisateur: number;

	@PrimaryColumn({ type: "int" })
	idDossier: number;

    @Column({ type: "varchar", length: 255 })
    droits: string;

    @ManyToOne(() => Utilisateur, utilisateur => utilisateur.permDossiers)
    utilisateur: Relation<Utilisateur>;
    @ManyToOne(() => Dossier, dossier => dossier.permDossiers)
    dossier: Relation<Dossier>;
}
