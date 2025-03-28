import { rateLimit } from "express-rate-limit";
import { Res } from "../types/response.entity";

/**
 * Middleware de limitation de débit pour Express.js.
 * Utilise le package express-rate-limit.
 * @param windowM Durée de la fenêtre (en minutes)
 * @param limit Nombre maximum de requêtes autorisées dans la fenêtre
 * @remarks
 * Les limites sont désactivés en mode test.
 * @example
 * this.router.post("/register",
 *		customLimitMiddleware(60, 5),
 *		expressAsyncHandler(this.register.bind(this)),
 * );
 * @returns Middleware de limitation de débit
 */
export const customLimitMiddleware = (windowM: number, limit: number) =>
	rateLimit({
		windowMs: windowM * 60 * 1000,
		limit,
		skip: () => process.env.BUILD === "test",
		message: {
			error: `Vous avez dépassé le nombre de requêtes autorisées. Réessayez dans !time_left! secondes.`,
		},
		handler: (request, response, next, options) => {
			try {
				const retryAfter = response.getHeaders()["retry-after"];
				const responseMessage = options.message.error.replace(
					"!time_left!",
					`${retryAfter}`,
				);
				response
					.status(options.statusCode)
					.send(new Res(options.statusCode, responseMessage));
			} catch (error) {
				response.status(options.statusCode).send(options.message);
			}
		},
	});
