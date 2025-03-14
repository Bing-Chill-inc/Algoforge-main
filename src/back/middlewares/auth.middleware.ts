import { AuthService } from "../api/auth/auth.service";

/**
 * Ce middleware permet de vérifier si l'utilisateur est connecté.
 * Si l'utilisateur n'est pas connecté, une erreur est renvoyée, voir {@link AuthService.verifyUser}.
 * @category Middlewares
 */
export const authMiddleware = async (req, res, next) => {
	const authService = new AuthService();

	// Vérification des droits de l'utilisateur
	const hasRights = await authService.verifyUser(req, res);
	if (!hasRights) return;

	next();
};
