export interface ClassRegistry {
	Bibliotheque: typeof import("../PartieEditeur/Bilbiotheque").Bibliotheque;
	Condition: typeof import("../PartieEditeur/Condition").Condition;
	ConditionSortie: typeof import("../PartieEditeur/ConditionSortie").ConditionSortie;
	DictionnaireDonnee: typeof import("../PartieEditeur/DictionnaireDonnee").DictionnaireDonnee;
	Editeur: typeof import("../PartieEditeur/Editeur").Editeur;
	ElementGraphique: typeof import("../PartieEditeur/ElementGraphique").ElementGraphique;
	ElementMenu: typeof import("../PartieEditeur/ElementMenu").ElementMenu;
	ElementMenuCompose: typeof import("../PartieEditeur/ElementMenuCompose").ElementMenuCompose;
	ElementMenuKeyboardTip: typeof import("../PartieEditeur/ElementMenuKeyboardTip").ElementMenuKeyboardTip;
	ElementParent: typeof import("../PartieEditeur/ElementParent").ElementParent;
	EvenementDispositionAutomatique: typeof import("../PartieEditeur/EvenementEdition/EvenementDispositionAutomatique").EvenementDispositionAutomatique;
	EvenementComposite: typeof import("../PartieEditeur/EvenementEdition/EvenementComposite").EvenementComposite;
	EvenementCreationElement: typeof import("../PartieEditeur/EvenementEdition/EvenementCreationElement").EvenementCreationElement;
	EvenementDeplacementCondition: typeof import("../PartieEditeur/EvenementEdition/EvenementDeplacementCondition").EvenementDeplacementCondition;
	EvenementDeplacementElement: typeof import("../PartieEditeur/EvenementEdition/EvenementDeplacementElement").EvenementDeplacementElement;
	EvenementDeplacementElementMultiples: typeof import("../PartieEditeur/EvenementEdition/EvenementDeplacementElementMultiples").EvenementDeplacementElementMultiples;
	EvenementEdition: typeof import("../PartieEditeur/EvenementEdition/EvenementEdition").EvenementEdition;
	EvenementEditionDonneesProbleme: typeof import("../PartieEditeur/EvenementEdition/EvenementEditionDonneesProbleme").EvenementEditionDonneesProbleme;
	EvenementEditionExpressionSwitch: typeof import("../PartieEditeur/EvenementEdition/EvenementEditionExpressionSwitch").EvenementEditionExpressionSwitch;
	EvenementEditionLibelleCondition: typeof import("../PartieEditeur/EvenementEdition/EvenementEditionLibelleCondition").EvenementEditionLibelleCondition;
	EvenementEditionLibelleProbleme: typeof import("../PartieEditeur/EvenementEdition/EvenementEditionLibelleProbleme").EvenementEditionLibelleProbleme;
	EvenementEditionResultatsProbleme: typeof import("../PartieEditeur/EvenementEdition/EvenementEditionResultatsProbleme").EvenementEditionResultatsProbleme;
	EvenementEditionStructureIterative: typeof import("../PartieEditeur/EvenementEdition/EvenementEditionStructureIterative").EvenementEditionStructureIterative;
	EvenementEditionTexte: typeof import("../PartieEditeur/EvenementEdition/EvenementEditionTexte").EvenementEditionTexte;
	EvenementLiaison: typeof import("../PartieEditeur/EvenementEdition/EvenementLiaison").EvenementLiaison;
	EvenementPlaceholder: typeof import("../PartieEditeur/EvenementEdition/EvenementPlaceholder").EvenementPlaceholder;
	EvenementSuppressionElement: typeof import("../PartieEditeur/EvenementEdition/EvenementSuppressionElement").EvenementSuppressionElement;
	EvenementSuppressionLiaison: typeof import("../PartieEditeur/EvenementEdition/EvenementSuppressionLiaison").EvenementSuppressionLiaison;
	FenetreModale: typeof import("../PartieEditeur/FenetreModale").FenetreModale;
	IndicateurZoom: typeof import("../PartieEditeur/IndicateurZoom").IndicateurZoom;
	Information: typeof import("../PartieEditeur/Information").Information;
	InviteBornesPourSI: typeof import("../PartieEditeur/InviteBornesPourSI").InviteBornesPourSI;
	InviteNouvelleBibliotheque: typeof import("../PartieEditeur/InviteNouvelleBibliotheque").InviteNouvelleBibliotheque;
	Lien: typeof import("../PartieEditeur/Lien").Lien;
	LienCompositionProbleme: typeof import("../PartieEditeur/LienCompositionProbleme").LienCompositionProbleme;
	LienDroit: typeof import("../PartieEditeur/LienDroit").LienDroit;
	LienTriple: typeof import("../PartieEditeur/LienTriple").LienTriple;
	Ligne: typeof import("../PartieEditeur/Ligne").Ligne;
	MenuCompte: typeof import("../PartieEditeur/MenuCompte").MenuCompte;
	MenuContextuel: typeof import("../PartieEditeur/MenuContextuel").MenuContextuel;
	MenuDeroulant: typeof import("../PartieEditeur/MenuDeroulant").MenuDeroulant;
	PlanTravail: typeof import("../PartieEditeur/PlanTravail").PlanTravail;
	Probleme: typeof import("../PartieEditeur/Probleme").Probleme;
	Procedure: typeof import("../PartieEditeur/Procedure").Procedure;
	RepresentationSelectionSimple: typeof import("../PartieEditeur/RepresentationSelectionSimple").RepresentationSelectionSimple;
	Selection: typeof import("../PartieEditeur/Selection").Selection;
	SelectionRectangle: typeof import("../PartieEditeur/SelectionRectangle").SelectionRectangle;
	SousPlanTravail: typeof import("../PartieEditeur/SousPlanTravail").SousPlanTravail;
	StructureAlternative: typeof import("../PartieEditeur/StructureAlternative").StructureAlternative;
	StructureIterative: typeof import("../PartieEditeur/StructureIterative").StructureIterative;
	StructureIterativeBornee: typeof import("../PartieEditeur/StructureIterativeBornee").StructureIterativeBornee;
	StructureIterativeNonBornee: typeof import("../PartieEditeur/StructureIterativeNonBornee").StructureIterativeNonBornee;
	StructureSi: typeof import("../PartieEditeur/StructureSi").StructureSi;
	StructureSwitch: typeof import("../PartieEditeur/StructureSwitch").StructureSwitch;
	SymboleDecomposition: typeof import("../PartieEditeur/SymboleDecomposition").SymboleDecomposition;
	ThemeEditeur: typeof import("../PartieEditeur/ThemeEditeur").ThemeEditeur;
	Type: typeof import("../PartieEditeur/Type").Type;
}

const storage: Partial<ClassRegistry> = {};

export const classes = new Proxy(storage as ClassRegistry, {
	get(target, property, receiver) {
		const value = Reflect.get(target, property, receiver);
		if (value === undefined) {
			throw new Error(`Editor class accessed before registration: ${String(property)}`);
		}
		return value;
	},
});

export function registerClasses(values: ClassRegistry): void {
	Object.assign(storage, values);
}
