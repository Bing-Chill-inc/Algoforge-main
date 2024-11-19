import "reflect-metadata";
import { DataSource } from "typeorm";
import { Utilisateur } from "./schemas/Utilisateur.schema";
import { Algorithme } from "./schemas/Algorithme.schema";
import { Token } from "./schemas/Token.schema";
import { Dossier } from "./schemas/Dossier.schema";
import { PermDossier } from "./schemas/PermDossier.schema";
import { PermAlgorithme } from "./schemas/PermAlgorithme.schema";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: "db_postgres",
	port: Number(process.env.POSTGRES_PORT),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	synchronize: true,
	logging: false,
	entities: [
		Utilisateur,
		Algorithme,
		Token,
		Dossier,
		PermDossier,
		PermAlgorithme,
	],
});
