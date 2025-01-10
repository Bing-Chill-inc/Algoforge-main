import "reflect-metadata";
import { DataSource } from "typeorm";
import { Utilisateur } from "./schemas/Utilisateur.schema";
import { Algorithme } from "./schemas/Algorithme.schema";
import { Token } from "./schemas/Token.schema";
import { Dossier } from "./schemas/Dossier.schema";
import { PermDossier } from "./schemas/PermDossier.schema";
import { PermAlgorithme } from "./schemas/PermAlgorithme.schema";

// Configuration de la source de données.
let dataSource: any = {};
switch (process.env.DATABASE_TYPE) {
	case "mysql":
	case "postgres":
		dataSource["type"] = process.env.DATABASE_TYPE;
		dataSource["database"] = process.env.DATABASE_NAME;
		dataSource["host"] = process.env.DATABASE_HOST ?? "localhost";
		dataSource["port"] = Number(process.env.DATABASE_PORT) ?? 5432;
		dataSource["username"] = process.env.DATABASE_USER;
		dataSource["password"] = process.env.DATABASE_PASSWORD;
		break;

	case "sqlite":
		dataSource["type"] = process.env.DATABASE_TYPE;
		dataSource["database"] = process.env.DATABASE_NAME;
		break;

	default:
		if (!dataSource["type"]) {
			throw new Error(".env: DATABASE_TYPE is not defined.");
		}
		break;
}

/**
 * Source de données de l'application.
 * @example
 * import { AppDataSource } from "./db/data-source";
 * AppDataSource.getRepository(Utilisateur).find();
 * @category Database
 */
export const AppDataSource = new DataSource({
	...dataSource,
	dropSchema: process.env.BUILD == "dev" ? true : false,
	synchronize: process.env.BUILD == "dev" ? true : false,
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
