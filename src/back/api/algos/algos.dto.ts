import {
	IsArray,
	IsDate,
	IsJSON,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from "class-validator";
import { PermAlgorithme } from "../../db/schemas/PermAlgorithme.schema";

/**
 * Classe de validation pour la création d'un algorithme.
 * @category DTOs
 * @category Algorithmes
 */
export class AlgoCreateDTO {
	/**
	 * Identifiant de l'algorithme.
	 * Il est généré automatiquement par la base de données.
	 * @example 1
	 * @type {number}
	 */
	@IsNumber()
	@IsOptional()
	id?: number;

	/**
	 * Nom de l'algorithme.
	 * @example "Mon algorithme"
	 * @type {string}
	 */
	@IsString()
	@MinLength(3)
	@MaxLength(255)
	nom: string;

	/**
	 * Date de création de l'algorithme.
	 * Il est indiqué automatiquement lors de la création de l'algorithme.
	 * @example "2023-10-01T00:00:00Z"
	 * @type {Date}
	 */
	@IsDate()
	@IsOptional()
	dateCreation?: Date;

	/**
	 * Date de modification de l'algorithme.
	 * Il est indiqué automatiquement lors de la création ou de la mise à jour de l'algorithme.
	 * @example "2023-10-01T00:00:00Z"
	 * @type {Date}
	 */
	@IsDate()
	@IsOptional()
	dateModification?: Date;

	/**
	 * Identifiant de l'utilisateur propriétaire de l'algorithme.
	 * @example 1
	 * @type {number}
	 */
	@IsNumber()
	ownerId: number;

	/**
	 * Identifiant de l'utilisateur ayant demandé la création de l'algorithme.
	 * Il est utilisé pour vérifier les droits de l'utilisateur, et indiqué automatiquement.
	 * @example 1
	 * @type {number}
	 */
	@IsNumber()
	requestedUserId: number;

	/**
	 * L'algorithme en lui-même.
	 * @type {Object}
	 */
	@IsJSON()
	sourceCode: Object;
}

/**
 * Classe de validation pour la mise à jour d'un algorithme.
 * @category DTOs
 * @category Algorithmes
 */
export class AlgoUpdateDTO {
	/**
	 * Identifiant de l'algorithme à mettre à jour.
	 * @example 1
	 * @type {number}
	 */
	@IsNumber()
	id: number;

	/**
	 * Nom de l'algorithme.
	 * @example "Mon algorithme"
	 * @type {string}
	 */
	@IsString()
	@MinLength(3)
	@MaxLength(255)
	nom: string;

	/**
	 * Identifiant de l'utilisateur ayant demandé la création de l'algorithme.
	 * Il est utilisé pour vérifier les droits de l'utilisateur, et indiqué automatiquement.
	 * @example 1
	 * @type {number}
	 */
	@IsNumber()
	requestedUserId: number;

	/**
	 * Liste de permissions de l'algorithme.
	 * @example [{ idUtilisateur: 1, idAlgorithme: 1, droits: "Owner" }]
	 * @type {PermAlgorithme[]}
	 */
	@IsArray()
	@IsOptional()
	permsAlgorithme?: PermAlgorithme[];

	@IsNumber()
	@IsOptional()
	dossierId?: number;

	/**
	 * L'algorithme mise à jour.
	 * @type {Object}
	 */
	@IsJSON()
	sourceCode: string;
}
