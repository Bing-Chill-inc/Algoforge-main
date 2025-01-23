import { Request } from "express";
import { Logger } from "../utils/logger";

/**
 * Ce middleware permet de journaliser les requêtes entrantes.
 * @category Middlewares
 */
export const loggerMiddleware = async (req: Request, res, next) => {
	if (process.env.IS_IP_LOGGED === "true") {
		Logger.log(`[${req.ip}] ${req.method} ${req.url}`);
	} else {
		Logger.log(`${req.method} ${req.url}`);
	}
	next();
};
