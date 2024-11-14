import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./schemas/User.schema";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: "localhost",
	port: Number(process.env.POSTGRES_PORT),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	synchronize: true,
	logging: false,
	entities: [User],
});
