import {
	IsEmail,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
	Length,
} from "class-validator";

/**
 * Classe de validation pour la création d'un utilisateur.
 * @category DTOs
 * @category Utilisateurs
 */
export class UserRegisterDTO {
	@Length(3, 30)
	@IsNotEmpty()
	pseudo: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@Length(8, 255)
	@IsNotEmpty()
	password: string;
}

/**
 * Classe de validation pour la connexion d'un utilisateur.
 * @category DTOs
 * @category Utilisateurs
 */
export class UserLoginDTO {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}

/**
 * Classe de validation pour la récupération de mot de passe d'un utilisateur.
 * @category DTOs
 * @category Utilisateurs
 */
export class UserUpdateDTO {
	@IsOptional()
	@Length(3, 30)
	pseudo?: string;

	@IsOptional()
	@IsNotEmpty()
	currentPassword: string;

	@IsOptional()
	@IsNumber()
	theme?: number;

	@IsOptional()
	@IsUrl()
	@Length(0, 255)
	urlPfp?: string;

	@IsOptional()
	@Length(8, 255)
	newPassword?: string;

	@IsNumber()
	requestedUserId: number;
}
