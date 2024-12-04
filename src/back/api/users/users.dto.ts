import {
	IsEmail,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from "class-validator";

/**
 * Classe de validation pour la création d'un utilisateur.
 */
export class UserRegisterDTO {
	@IsString()
	@MinLength(1)
	@MaxLength(255)
	pseudo: string;

	@IsString()
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(8)
	@MaxLength(255)
	password: string;
}

/**
 * Classe de validation pour la connexion d'un utilisateur.
 */
export class UserLoginDTO {
	@IsString()
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(8)
	@MaxLength(255)
	password: string;
}

/**
 * Classe de validation pour la récupération de mot de passe d'un utilisateur.
 */
export class UserUpdateDTO {
	@IsString()
	@IsOptional()
	@MinLength(1)
	@MaxLength(255)
	pseudo: string;

	@IsString()
	@IsOptional()
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(8)
	@MaxLength(255)
	currentPassword: string;

	@IsString()
	@IsOptional()
	@MinLength(8)
	@MaxLength(255)
	newPassword: string;
}
