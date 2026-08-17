import type { AlgoForgeDocumentV1 } from "../../../common/algorithmFormat";

export type AlgoForgeSourceCode = AlgoForgeDocumentV1 | unknown[];

// Définition du type notification
export type notification = "error" | "success" | "warning";

// Définition du type User
export type User = {
	id: number;
	adresseMail: string;
	pseudo: string;
	dateInscription: string;
	theme: number;
	urlPfp: string | null;
	isVerified: boolean;
	tokens?: {
		dateCreation: number;
		dateExpiration: number;
		token: string;
	}[];
};

// Définition du type Algo
export type Algo = {
	id: number;
	nom: string;
	ownerId: number;
	sourceCode: AlgoForgeSourceCode;
	dateCreation?: string;
	dateModification?: string;
	dateSuppression?: string;
	idDossier?: number;
	droits?: string;
};
