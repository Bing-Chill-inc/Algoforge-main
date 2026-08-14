export type AnomalyRuleId =
	| "magic-input"
	| "unused-input"
	| "unused-output"
	| "magic-variable"
	| "exit-outside-loop"
	| "exit-in-bounded-loop"
	| "unreachable-after-exit"
	| "invalid-comparison-syntax"
	| "invalid-assignment-syntax"
	| "unbounded-loop-without-exit"
	| "nonterminating-bounded-loop"
	| "too-many-children"
	| "plan-too-large"
	| "inconsistent-alternative-types"
	| "inconsistent-if-information"
	| "switch-case-comparison"
	| "if-prefer-switch"
	| "dynamic-type";

export type AnomalySeverity = "error" | "warning";
export type AnalysisPath = string;
export type AnalysisNodeKind =
	| "problem"
	| "procedure"
	| "if"
	| "switch"
	| "bounded-loop"
	| "unbounded-loop"
	| "exit";

export interface AnalysisSequence {
	readonly path: AnalysisPath;
	readonly label?: string;
	readonly nodes: readonly AnalysisNode[];
}

export interface AnalysisNode {
	readonly path: AnalysisPath;
	readonly kind: AnalysisNodeKind;
	readonly label?: string;
	readonly inputs: readonly string[];
	readonly outputs: readonly string[];
	readonly expression?: string;
	readonly iterator?: string;
	readonly lowerBound?: string;
	readonly upperBound?: string;
	readonly step?: string;
	readonly increasing?: boolean;
	readonly sequences: readonly AnalysisSequence[];
}

export interface AnalysisPlanLayout {
	readonly path: AnalysisPath;
	readonly targetPaths: readonly AnalysisPath[];
	readonly width: number;
	readonly height: number;
	readonly viewportWidth: number;
	readonly viewportHeight: number;
}

export interface AnalysisSnapshot {
	readonly roots: AnalysisSequence;
	readonly dictionary: Readonly<Record<string, string | undefined>>;
	readonly layouts: readonly AnalysisPlanLayout[];
}

export interface FixDescriptor {
	readonly id:
		| "normalize-assignment"
		| "normalize-comparison"
		| "normalize-switch-case"
		| "convert-if-to-switch"
		| "prettify-plan";
	readonly label: string;
	readonly requiresConfirmation: boolean;
	readonly payload?: Readonly<Record<string, string | readonly string[]>>;
}

export interface AnomalyFinding {
	readonly fingerprint: string;
	readonly ruleId: AnomalyRuleId;
	readonly severity: AnomalySeverity;
	readonly title: string;
	readonly message: string;
	readonly explanation: string;
	readonly evidence?: string;
	readonly suggestion: string;
	readonly targetPaths: readonly AnalysisPath[];
	readonly fix?: FixDescriptor;
}

export interface AnalysisFailure {
	readonly ruleId: AnomalyRuleId;
	readonly message: string;
}

export interface AnalysisContext {
	readonly requestedAt?: number;
}

export interface AnalysisResult {
	readonly findings: readonly AnomalyFinding[];
	readonly failures: readonly AnalysisFailure[];
}

export interface DomAnalysisCapture {
	readonly snapshot: AnalysisSnapshot;
	readonly elements: ReadonlyMap<AnalysisPath, HTMLElement>;
	readonly plans: ReadonlyMap<AnalysisPath, HTMLElement>;
}
