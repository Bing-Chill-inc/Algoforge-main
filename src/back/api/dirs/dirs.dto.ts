import {
	IsArray,
	IsDate,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from "class-validator";
import { PermDossier } from "../../db/schemas/PermDossier.schema";

/**
 * Classe de validation pour la création d'un dossier.
 * @category DTOs
 * @category Dossiers
 */
export class DirCreateDTO {
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
    idParent: number;

    @IsNumber()
    ownerId: number;

    @IsNumber()
    requestedUserId: number;
}

/**
 * Classe de validation pour la mise à jour d'un dossier.
 * @category DTOs
 * @category Dossiers
 */
export class DirUpdateDTO {
    @IsNumber()
    id: number;

    @IsString()
    @MinLength(3)
    @MaxLength(255)
    nom: string;

    @IsNumber()
    idParent: number;

    @IsNumber()
    requestedUserId: number;

    @IsArray()
    @IsOptional()
    permsDossier?: PermDossier[];
}
