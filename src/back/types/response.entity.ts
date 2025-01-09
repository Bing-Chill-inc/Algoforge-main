/**
 * Classe définissant la structure d'une réponse.
 * @category Types
 */
export class Res {
	/**
	 * Statut de la réponse.
	 * @public
	 * @type {number}
	 */
	statut: number;

	/**
	 * Message de la réponse.
	 * @public
	 * @type {string}
	 */
	message: string;

	/**
	 * Données supplémentaires potentielles.
	 * @public
	 * @type {any}
	 */
	data?: any;

	constructor(statut: number, message: string, data?: any) {
		this.statut = statut;
		this.message = message;
		this.data = data;
	}
}
