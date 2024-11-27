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
 */
export class AlgoCreateDTO {
	@IsNumber()
	@IsOptional()
	id: number;

	@IsString()
	@MinLength(3)
	@MaxLength(255)
	nom: string;

	@IsDate()
	@IsOptional()
	dateCreation: Date;

	@IsDate()
	@IsOptional()
	dateModification: Date;

	@IsNumber()
	ownerId: number;

	@IsJSON()
	sourceCode: string;
}

/**
 * Classe de validation pour la mise à jour d'un algorithme.
 */
export class AlgoUpdateDTO {
	@IsNumber()
	id: number;

	@IsString()
	@MinLength(3)
	@MaxLength(255)
	nom: string;

	@IsDate()
	@IsOptional()
	dateCreation: Date;

	@IsDate()
	@IsOptional()
	dateModification: Date;

	@IsArray()
	@IsOptional()
	permsAlgorithme: PermAlgorithme[];

	@IsJSON()
	sourceCode: string;
}
