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
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsString()
	@MinLength(3)
	@MaxLength(255)
	nom: string;

	@IsDate()
	@IsOptional()
	dateCreation?: Date;

	@IsDate()
	@IsOptional()
	dateModification?: Date;

	@IsNumber()
	ownerId: number;

	@IsNumber()
	requestedUserId: number;

	@IsJSON()
	sourceCode: Object;
}

/**
 * Classe de validation pour la mise à jour d'un algorithme.
 * @category DTOs
 * @category Algorithmes
 */
export class AlgoUpdateDTO {
	@IsNumber()
	id: number;

	@IsString()
	@MinLength(3)
	@MaxLength(255)
	nom: string;

	@IsNumber()
	requestedUserId: number;

	@IsArray()
	@IsOptional()
	permsAlgorithme?: PermAlgorithme[];

	@IsNumber()
	@IsOptional()
	dossierId?: number;

	@IsJSON()
	sourceCode: string;
}
