import { validate, ValidationError } from "class-validator";

/**
 * Fonction validant les données d'une classe DTO.
 * @param data Données à valider.
 * @returns Si invalide, renvoie la première erreur, sinon null.
 * @example
 * const data = new UserRegisterDTO();
 * data.email = "test@@";
 * data.password = "testtest";
 * data.pseudo = "Test de ToxykAuBleu";
 * const validationErrors = await classValidator(data);
 * if (validationErrors) {
 *    return res
 *      .status(400)
 *     .json(new Res(400, "Données invalides", validationErrors));
 * }
 * @category Utils
 */
export async function validateClass(
	data: any,
): Promise<ValidationError[] | null> {
	// Validation des données.
	return validate(data, { stopAtFirstError: true }).then((errors) => {
		// Si des erreurs sont liées à un champ, on les retourne, sinon null.
		return errors.length > 0 ? errors : null;
	});
}
