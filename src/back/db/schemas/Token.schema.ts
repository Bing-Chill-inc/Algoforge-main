import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { Utilisateur } from "./Utilisateur.schema";

@Entity()
export class Token {
	@PrimaryColumn({ type: "varchar", length: 255 })
	token: string;

	@Column({ type: "datetime" })
	dateCreation: Date;

	@Column({ type: "datetime" })
	dateExpiration: Date;

	@ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.tokens)
	utilisateur: Relation<Utilisateur>;
}
