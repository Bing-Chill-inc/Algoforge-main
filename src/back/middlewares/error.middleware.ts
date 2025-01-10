import { Res } from "../types/response.entity";
import { Logger } from "../utils/logger";

/**
 * Ce middleware permet de gérer les erreurs survenues lors du traitement des requêtes.
 * Il sert également à ce que l'application ne plante pas en cas d'erreur.
 * @category Middlewares
 */
export const errorMiddleware = async (error, req, res, next) => {
	const errorMessage: string =
		process.env.BUILD === "dev" ? error.stack : error.message;

	Logger.error(
		`Une erreur est survenue lors du traitement de la requête: \n${errorMessage}`,
		"middleware: error",
	);

	const statusCode = error.statusCode || 500;
	const result = new Res(
		statusCode,
		"Une erreur est survenue lors du traitement de la requête.",
	);

	res.status(statusCode).json(result);
};
