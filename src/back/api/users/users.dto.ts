import {
	IsEmail,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Length,
} from "class-validator";

/**
 * Classe de validation pour la création d'un utilisateur.
 * @category DTOs
 * @category Utilisateurs
 */
export class UserRegisterDTO {
	@Length(3, 255)
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
	@Length(3, 255)
	pseudo?: string;

	@IsNotEmpty()
	currentPassword: string;

	@IsOptional()
	@Length(8, 255)
	newPassword?: string;

	@IsNumber()
	requestedUserId: number;
}
