/**
 * Classe définissant la structure d'une réponse.
 */
export class Res {
	/**
	 * Statut de la réponse.
	 */
	statut: number;

	/**
	 * Message de la réponse.
	 */
	message: string;

	/**
	 * Données supplémentaires potentielles.
	 */
	data?: any;

	constructor(statut: number, message: string, data?: any) {
		this.statut = statut;
		this.message = message;
		this.data = data;
	}
}
