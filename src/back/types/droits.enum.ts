/**
 * Enumération des droits d'accès aux algorithmes/dossiers pour un utilisateur.
 * @category Types
 */
export enum Droits {
	/**
	 * L'utilisateur est propriétaire de l'algorithme/dossier.
	 */
	Owner = "owner",
	/**
	 * L'utilisateur a le droit de lecture/écriture sur l'algorithme/dossier.
	 */
	ReadWrite = "read-write",
	/**
	 * L'utilisateur a le droit de lecture seule sur l'algorithme/dossier.
	 */
	ReadOnly = "read-only",
}
