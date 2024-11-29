import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Token } from "./Token.schema";
import { PermDossier } from "./PermDossier.schema";
import { PermAlgorithme } from "./PermAlgorithme.schema";

@Entity()
export class Utilisateur {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", length: 255 })
	adresseMail: string;

	@Column({ type: "varchar", length: 255 })
	mdpHash: string;

	@Column({ type: "date" })
	dateInscription: Date;

	@Column({ type: "int" })
	theme: number;

	@Column({ type: "varchar", length: 255 })
	urlPfp: string;

	@OneToMany(() => Token, (token) => token.utilisateur)
	tokens: Token[];

	// Droits d'accès aux dossiers et aux algorithmes.
	@OneToMany(() => PermDossier, (permDossier) => permDossier.idUtilisateur)
	permDossiers: Relation<PermDossier[]>;
	@OneToMany(() => PermAlgorithme, (permAlgo) => permAlgo.idUtilisateur)
	permAlgorithmes: Relation<PermAlgorithme[]>;
}
