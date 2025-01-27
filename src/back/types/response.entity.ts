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

/**
 * Réponse en cas de requête mal formée.
 * @category Types
 * @extends Res
 */
export class BadRequestRes extends Res {
	static statut = 400;
	constructor(message: string, data?: any) {
		super(BadRequestRes.statut, message, data);
	}
}

/**
 * Réponse en cas de non autorisation.
 * @category Types
 * @extends Res
 */
export class UnauthorizedRes extends Res {
	static statut = 401;
	constructor(message: string, data?: any) {
		super(UnauthorizedRes.statut, message, data);
	}
}

/**
 * Réponse en cas d'accès interdit.
 * @category Types
 * @extends Res
 */
export class ForbiddenRes extends Res {
	static statut = 403;
	constructor(message: string, data?: any) {
		super(ForbiddenRes.statut, message, data);
	}
}

/**
 * Réponse en cas de ressource non trouvée.
 * @category Types
 * @extends Res
 */
export class NotFoundRes extends Res {
	static statut = 404;
	constructor(message: string, data?: any) {
		super(NotFoundRes.statut, message, data);
	}
}

/**
 * Réponse en cas d'erreur interne du serveur.
 * @category Types
 * @extends Res
 */
export class InternalServerErrorRes extends Res {
	static statut = 500;
	constructor(message: string, data?: any) {
		super(InternalServerErrorRes.statut, message, data);
	}
}

/**
 * Réponse en cas de succès.
 * @category Types
 * @extends Res
 */
export class OkRes extends Res {
	static statut = 200;
	constructor(message: string, data?: any) {
		super(OkRes.statut, message, data);
	}
}

/**
 * Réponse en cas de création de la ressource.
 * @category Types
 * @extends Res
 *
 */
export class CreatedRes extends Res {
	static statut = 201;
	constructor(message: string, data?: any) {
		super(CreatedRes.statut, message, data);
	}
}
