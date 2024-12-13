import { z } from "zod";
import { Logger } from "./logger";

// Définition des types d'éléments possibles.
enum TypeElement {
	Probleme = "Probleme",
	StructureIterativeNonBornee = "StructureIterativeNonBornee",
	StructureSi = "StructureSi",
	Condition = "Condition",
	ConditionSortie = "ConditionSortie",
	DictionnaireDonnee = "DictionnaireDonnee",
}
const TypeElementEnum = z.enum([
	TypeElement.Probleme,
	TypeElement.StructureIterativeNonBornee,
	TypeElement.StructureSi,
	TypeElement.Condition,
	TypeElement.ConditionSortie,
	TypeElement.DictionnaireDonnee,
]);

// Définition des schémas de validation.
const coordonneeSchema = z.string().endsWith("vw");
const enfants = z.array(
	z.lazy(() =>
		z.discriminatedUnion("typeElement", [
			ProblemeSchema,
			StructureSiSchema,
			StructureIterativeNonBorneeSchema,
			ConditionSortieSchema,
			DictionnaireDonneeSchema,
		]),
	),
);

// -> Probleme
const BaseProblemeSchema = z.object({
	typeElement: TypeElementEnum.extract([TypeElement.Probleme]),
	abscisse: coordonneeSchema,
	ordonnee: coordonneeSchema,
	libelle: z.string(),
	listeDonnes: z.array(z.string()).default([""]),
	listeResultats: z.array(z.string()).default([""]),
	estDecomposeAilleurs: z.boolean().optional(),
});
const ProblemeSchema = BaseProblemeSchema.extend({
	enfants: enfants.default([]),
});

// -> Dictionnaire de données
// TODO: compléter avec les valeurs possibles du dictionnaire de données.
const DictionnaireDonneeSchema = z.object({
	typeElement: TypeElementEnum.extract([TypeElement.DictionnaireDonnee]),
});

// -> Structure itérative non bornée
const BaseStructureIterativeNonBorneeSchema = z.object({
	typeElement: TypeElementEnum.extract([
		TypeElement.StructureIterativeNonBornee,
	]),
	abscisse: coordonneeSchema,
	ordonnee: coordonneeSchema,
});
const StructureIterativeNonBorneeSchema =
	BaseStructureIterativeNonBorneeSchema.extend({
		enfants: enfants.default([]),
	});

// TODO: -> Structure iterative bornée

// -> Condition
const BaseConditionSchema = z.object({
	typeElement: TypeElementEnum.extract([TypeElement.Condition]),
	libelle: z.string(),
});
const ConditionSchema = BaseConditionSchema.extend({
	enfants: enfants.default([]),
});
// -> Structure si
const StructureSiSchema = z.object({
	typeElement: TypeElementEnum.extract([TypeElement.StructureSi]),
	abscisse: coordonneeSchema,
	ordonnee: coordonneeSchema,
	conditions: z.array(ConditionSchema).default([]),
});

// -> Condition de sortie
const ConditionSortieSchema = z.object({
	typeElement: TypeElementEnum.extract([TypeElement.ConditionSortie]),
	abscisse: coordonneeSchema,
	ordonnee: coordonneeSchema,
});

// === Algorithme
const AlgoSchema = enfants;

/**
 * Classe de validation des algorithmes.
 */
export class AlgoValidator {
	constructor() {
		throw new Error("Cette classe n'est pas instanciable.");
	}

	/**
	 * Valide un algorithme.
	 * @param algo Algorithme à valider.
	 * @returns Objet contenant le résultat de la validation.
	 * Pour sauvegarder l'algorithme conforme, utilisez la propriété `data`.
	 * @example
	 * // Types de retour possibles:
	 * // { success: true, data: [{...}] }
	 * // { success: false, error: [{...}] }
	 */
	static validateAlgo(algo: Object) {
		try {
			const parsedAlgo = AlgoSchema.safeParse(algo);
			Logger.debug(JSON.stringify(parsedAlgo), "AlgoValidator", 6);
			return parsedAlgo;
		} catch (error) {
			throw error;
		}
	}
}
