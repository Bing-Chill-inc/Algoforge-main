import {
	IsEmail,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsStrongPassword,
	IsUrl,
	Length,
} from "class-validator";

/**
 * Classe de validation pour la création d'un utilisateur.
 * @category DTOs
 * @category Utilisateurs
 */
export class UserRegisterDTO {
	/**
	 * Pseudonyme de l'utilisateur.
	 * @example "MonPseudo"
	 * @type {string}
	 */
	@Length(3, 30)
	@IsNotEmpty()
	pseudo: string;

	/**
	 * Email de l'utilisateur.
	 * @example "test@example.com"
	 * @type {string}
	 */
	@IsEmail()
	@IsNotEmpty()
	email: string;

	/**
	 * Mot de passe de l'utilisateur.
	 * Le mot de passe doit être composé d'au moins 8 caractères, d'au moins 1 lettre minuscule, d'au moins 1 lettre majuscule, d'au moins 1 chiffre et d'au moins 1 symbole.
	 * @example "MonMotDePasse!123"
	 * @type {string}
	 */
	@Length(8, 255)
	@IsStrongPassword({
		minLength: 8,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	@IsNotEmpty()
	password: string;
}

/**
 * Classe de validation pour la connexion d'un utilisateur.
 * @category DTOs
 * @category Utilisateurs
 */
export class UserLoginDTO {
	/**
	 * Email de l'utilisateur.
	 * @example "test@example.com"
	 * @type {string}
	 */
	@IsEmail()
	@IsNotEmpty()
	email: string;

	/**
	 * Mot de passe de l'utilisateur.
	 * @example "MonMotDePasse"
	 * @type {string}
	 */
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
	/**
	 * Pseudonyme de l'utilisateur.
	 * @example "MonPseudo"
	 * @type {string}
	 */
	@IsOptional()
	@Length(3, 30)
	pseudo?: string;

	/**
	 * Mot de passe actuel de l'utilisateur.
	 * @example "MonMotDePasseActuel"
	 * @type {string}
	 */
	@IsOptional()
	@IsNotEmpty()
	currentPassword: string;

	/**
	 * Thème de l'utilisateur.
	 * @example 1
	 * @type {number}
	 */
	@IsOptional()
	@IsNumber()
	theme?: number;

	/**
	 * URL de la photo de profil de l'utilisateur.
	 * L'URL doit être valide, et doit correspondre à une image.
	 * @example "https://example.com/photo.jpg"
	 * @type {string}
	 */
	@IsOptional()
	@IsUrl()
	@Length(0, 255)
	urlPfp?: string;

	/**
	 * Le mot de passe doit être composé d'au moins 8 caractères, d'au moins 1 lettre minuscule, d'au moins 1 lettre majuscule, d'au moins 1 chiffre et d'au moins 1 symbole.
	 * @example "MonMotDePasse!123"
	 * @type {string}
	 */
	@IsOptional()
	@IsStrongPassword({
		minLength: 8,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	@IsNotEmpty()
	newPassword?: string;

	/**
	 * Identifiant de l'utilisateur ayant demandé la création de l'algorithme.
	 * Il est utilisé pour vérifier les droits de l'utilisateur, et indiqué automatiquement.
	 * @example 1
	 * @type {number}
	 */
	@IsNumber()
	requestedUserId: number;
}
