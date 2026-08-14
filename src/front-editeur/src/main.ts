import "./modules/safari-pollyfill.js";
import { readRuntimeConfig } from "./runtime/config";
import { registerClasses } from "./runtime/classRegistry";
import { initializeHost } from "./runtime/host";
import { editeur, initializeRuntime, preferences, requiredElement, titreAlgo } from "./runtime/runtime";
import { initializeInterfaceEffects } from "./runtime/ui-effects";
import { initializeVsCodeIntegration } from "./runtime/vscodeIntegration";
import { Type } from "./PartieEditeur/Type";
import { Information } from "./PartieEditeur/Information";
import { DictionnaireDonnee } from "./PartieEditeur/DictionnaireDonnee";
import { PlanTravail } from "./PartieEditeur/PlanTravail";
import { SousPlanTravail } from "./PartieEditeur/SousPlanTravail";
import { ElementGraphique } from "./PartieEditeur/ElementGraphique";
import { Probleme } from "./PartieEditeur/Probleme";
import { StructureAlternative } from "./PartieEditeur/StructureAlternative";
import { StructureIterative } from "./PartieEditeur/StructureIterative";
import { InviteBornesPourSI } from "./PartieEditeur/InviteBornesPourSI";
import { ConditionSortie } from "./PartieEditeur/ConditionSortie";
import { Procedure } from "./PartieEditeur/Procedure";
import { Condition } from "./PartieEditeur/Condition";
import { StructureSi } from "./PartieEditeur/StructureSi";
import { StructureSwitch } from "./PartieEditeur/StructureSwitch";
import { StructureIterativeBornee } from "./PartieEditeur/StructureIterativeBornee";
import { StructureIterativeNonBornee } from "./PartieEditeur/StructureIterativeNonBornee";
import { ElementParent } from "./PartieEditeur/ElementParent";
import { Ligne } from "./PartieEditeur/Ligne";
import { Lien } from "./PartieEditeur/Lien";
import { LienDroit } from "./PartieEditeur/LienDroit";
import { LienCompositionProbleme } from "./PartieEditeur/LienCompositionProbleme";
import { LienTriple } from "./PartieEditeur/LienTriple";
import { SymboleDecomposition } from "./PartieEditeur/SymboleDecomposition";
import { Selection } from "./PartieEditeur/Selection";
import { RepresentationSelectionSimple } from "./PartieEditeur/RepresentationSelectionSimple";
import { SelectionRectangle } from "./PartieEditeur/SelectionRectangle";
import { MenuDeroulant } from "./PartieEditeur/MenuDeroulant";
import { ElementMenu } from "./PartieEditeur/ElementMenu";
import { ElementMenuCompose } from "./PartieEditeur/ElementMenuCompose";
import { ElementMenuKeyboardTip } from "./PartieEditeur/ElementMenuKeyboardTip";
import { ThemeEditeur } from "./PartieEditeur/ThemeEditeur";
import { IndicateurZoom } from "./PartieEditeur/IndicateurZoom";
import { MenuContextuel } from "./PartieEditeur/MenuContextuel";
import { Bibliotheque } from "./PartieEditeur/Bilbiotheque";
import { InviteNouvelleBibliotheque } from "./PartieEditeur/InviteNouvelleBibliotheque";
import { FenetreModale } from "./PartieEditeur/FenetreModale";
import { MenuCompte } from "./PartieEditeur/MenuCompte";
import { EvenementEdition } from "./PartieEditeur/EvenementEdition/EvenementEdition";
import { EvenementCreationElement } from "./PartieEditeur/EvenementEdition/EvenementCreationElement";
import { EvenementSuppressionElement } from "./PartieEditeur/EvenementEdition/EvenementSuppressionElement";
import { EvenementLiaison } from "./PartieEditeur/EvenementEdition/EvenementLiaison";
import { EvenementSuppressionLiaison } from "./PartieEditeur/EvenementEdition/EvenementSuppressionLiaison";
import { EvenementDeplacementElement } from "./PartieEditeur/EvenementEdition/EvenementDeplacementElement";
import { EvenementDeplacementElementMultiples } from "./PartieEditeur/EvenementEdition/EvenementDeplacementElementMultiples";
import { EvenementDeplacementCondition } from "./PartieEditeur/EvenementEdition/EvenementDeplacementCondition";
import { EvenementEditionTexte } from "./PartieEditeur/EvenementEdition/EvenementEditionTexte";
import { EvenementEditionLibelleProbleme } from "./PartieEditeur/EvenementEdition/EvenementEditionLibelleProbleme";
import { EvenementEditionDonneesProbleme } from "./PartieEditeur/EvenementEdition/EvenementEditionDonneesProbleme";
import { EvenementEditionResultatsProbleme } from "./PartieEditeur/EvenementEdition/EvenementEditionResultatsProbleme";
import { EvenementEditionLibelleCondition } from "./PartieEditeur/EvenementEdition/EvenementEditionLibelleCondition";
import { EvenementEditionExpressionSwitch } from "./PartieEditeur/EvenementEdition/EvenementEditionExpressionSwitch";
import { EvenementEditionStructureIterative } from "./PartieEditeur/EvenementEdition/EvenementEditionStructureIterative";
import { EvenementDispositionAutomatique } from "./PartieEditeur/EvenementEdition/EvenementDispositionAutomatique";
import { EvenementComposite } from "./PartieEditeur/EvenementEdition/EvenementComposite";
import { EvenementPlaceholder } from "./PartieEditeur/EvenementEdition/EvenementPlaceholder";
import { Editeur } from "./PartieEditeur/Editeur";

const config = readRuntimeConfig();
initializeRuntime(config);
initializeHost();
registerClasses({
	Type,
	Information,
	DictionnaireDonnee,
	PlanTravail,
	SousPlanTravail,
	ElementGraphique,
	Probleme,
	StructureAlternative,
	StructureIterative,
	InviteBornesPourSI,
	ConditionSortie,
	Procedure,
	Condition,
	StructureSi,
	StructureSwitch,
	StructureIterativeBornee,
	StructureIterativeNonBornee,
	ElementParent,
	Ligne,
	Lien,
	LienDroit,
	LienCompositionProbleme,
	LienTriple,
	SymboleDecomposition,
	Selection,
	RepresentationSelectionSimple,
	SelectionRectangle,
	MenuDeroulant,
	ElementMenu,
	ElementMenuCompose,
	ElementMenuKeyboardTip,
	ThemeEditeur,
	IndicateurZoom,
	MenuContextuel,
	Bibliotheque,
	InviteNouvelleBibliotheque,
	FenetreModale,
	MenuCompte,
	EvenementEdition,
	EvenementCreationElement,
	EvenementSuppressionElement,
	EvenementLiaison,
	EvenementSuppressionLiaison,
	EvenementDeplacementElement,
	EvenementDeplacementElementMultiples,
	EvenementDeplacementCondition,
	EvenementEditionTexte,
	EvenementEditionLibelleProbleme,
	EvenementEditionDonneesProbleme,
	EvenementEditionResultatsProbleme,
	EvenementEditionLibelleCondition,
	EvenementEditionExpressionSwitch,
	EvenementEditionStructureIterative,
	EvenementDispositionAutomatique,
	EvenementComposite,
	EvenementPlaceholder,
	Editeur,
});

defineCustomElement("dictionnaire-donnee", DictionnaireDonnee);
defineCustomElement("plan-travail", PlanTravail);
defineCustomElement("sous-plan-travail", SousPlanTravail);
defineCustomElement("probleme-element", Probleme);
defineCustomElement("invite-bornes-pour-si", InviteBornesPourSI);
defineCustomElement("condition-sortie-element", ConditionSortie);
defineCustomElement("procedure-element", Procedure);
defineCustomElement("condition-element", Condition);
defineCustomElement("structure-si-element", StructureSi);
defineCustomElement("structure-switch-element", StructureSwitch);
defineCustomElement("structure-iterative-bornee-element", StructureIterativeBornee);
defineCustomElement("structure-iterative-non-bornee-element", StructureIterativeNonBornee);
defineCustomElement("ligne-element", Ligne);
defineCustomElement("symbole-decomposition-element", SymboleDecomposition);
defineCustomElement("selection-editeur", Selection);
defineCustomElement("selection-simple", RepresentationSelectionSimple);
defineCustomElement("selection-rectangle", SelectionRectangle);
defineCustomElement("menu-deroulant", MenuDeroulant);
defineCustomElement("element-menu", ElementMenu);
defineCustomElement("element-menu-compose", ElementMenuCompose);
defineCustomElement("element-menu-keyboard-tip", ElementMenuKeyboardTip);
defineCustomElement("theme-editeur", ThemeEditeur, {
	extends: "option",
});
defineCustomElement("indicateur-zoom", IndicateurZoom);
defineCustomElement("menu-contextuel", MenuContextuel);
defineCustomElement("bibliotheque-algorithmique", Bibliotheque);
defineCustomElement("invite-nouvelle-bibliotheque", InviteNouvelleBibliotheque);
defineCustomElement("fenetre-modale", FenetreModale);
defineCustomElement("menu-compte-element", MenuCompte);
defineCustomElement("editeur-interface", Editeur);

initializeInterfaceEffects();
initializeVsCodeIntegration();

if (config.title !== null) {
	titreAlgo.innerText = config.title;
	document.title = `Algoforge - ${config.title}`;
}
if (config.initialAlgorithm !== null) {
	const workspace = editeur._espacePrincipal as unknown as {
		chargerDepuisJSON(value: unknown): void;
	};
	workspace.chargerDepuisJSON(config.initialAlgorithm);
	if (config.prettifyInitialAlgorithm) {
		requestAnimationFrame(() => editeur.prettifyPlanActif({ enregistrerEvenement: false }));
	}
}

if (__ALGOFORGE_ANOMALY_DETECTION__ && !config.isExam) {
	let preferenceVersion = 0;
	let integration: Promise<typeof import("./anomalies/integration")> | undefined;
	const synchronizeAnomalyDetection = async (enabled: boolean): Promise<void> => {
		const version = ++preferenceVersion;
		if (!enabled && !integration) return;
		try {
			integration ??= import("./anomalies/integration");
			const { setAnomalyDetectionEnabled } = await integration;
			if (version !== preferenceVersion) return;
			setAnomalyDetectionEnabled(editeur, enabled);
		} catch (error) {
			console.error("[Anomalies] Initialisation impossible", error);
		}
	};
	void import("./anomalies/preference")
		.then(({ initializeAnomalyPreference }) => {
			initializeAnomalyPreference(editeur, preferences.anomalyDetection, (enabled) => {
				preferences.anomalyDetection = enabled;
				void synchronizeAnomalyDetection(enabled);
			});
			void synchronizeAnomalyDetection(preferences.anomalyDetection);
		})
		.catch((error) => console.error("[Anomalies] Préférence indisponible", error));
}

function defineCustomElement(
	name: string,
	constructor: CustomElementConstructor,
	options?: ElementDefinitionOptions,
): void {
	if (!customElements.get(name)) customElements.define(name, constructor, options);
}
