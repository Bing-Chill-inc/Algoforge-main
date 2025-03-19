import bcrypt from "bcrypt-nodejs";

/**
 * Permet de hasher une chaine de caractère, pratique pour stocker les mots de passe en base de données.
 * @param toHash Chaine de caractère à hasher.
 * @returns La chainde de caractère hashée.
 */
export function hashString(toHash: string): string {
	const salt = bcrypt.genSaltSync(10);
	return bcrypt.hashSync(toHash, salt);
}
