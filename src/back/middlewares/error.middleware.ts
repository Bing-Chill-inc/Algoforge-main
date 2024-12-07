import { Logger } from "../utils/logger";

/**
 * Ce middleware permet de gérer les erreurs survenues lors du traitement des requêtes.
 * Il sert également à ce que l'application ne plante pas en cas d'erreur.
 */
export const errorMiddleware = async (error, req, res, next) => {
	Logger.error(
		`Une rreur est survenue lors du traitement de la requête: \n${error.stack}`,
		"middleware: error",
	);
	res.status(500).json({
		message: "Une erreur est survenue lors du traitement de la requête.",
	});
};
