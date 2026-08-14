export type InferredType = "boolean" | "number" | "character" | "string" | "unknown";

export interface ParsedAssignment {
	readonly isAssignment: boolean;
	readonly valid: boolean;
	readonly lhs?: string;
	readonly rhs?: string;
	readonly operator?: string;
	readonly identifiers: readonly string[];
	readonly inferredType: InferredType;
}

export interface ParsedComparison {
	readonly left: string;
	readonly operator: string;
	readonly right: string;
	readonly rightType: InferredType;
}

export interface ParsedCondition {
	readonly valid: boolean;
	readonly isElse: boolean;
	readonly usesDoubleEquals: boolean;
	readonly identifiers: readonly string[];
	readonly comparisons: readonly ParsedComparison[];
}

const KEYWORDS = new Set([
	"ET",
	"OU",
	"NON",
	"SINON",
	"TRUE",
	"FALSE",
	"VRAI",
	"FAUX",
	"POUR",
	"ALLANT",
	"DE",
	"A",
	"À",
	"PAR",
	"PAS",
	"CROISSANT",
	"DECROISSANT",
	"DÉCROISSANT",
]);

const IDENTIFIER = /^[\p{L}_][\p{L}\p{N}_]*(?:[ \t]+[\p{L}_][\p{L}\p{N}_]*)*$/u;
const COMPARISON = /(==|!=|<>|<=|>=|≠|≤|≥|=|<|>)/g;

export function stripQuotedText(value: string): string {
	let quote: "'" | '"' | null = null;
	let escaped = false;
	let result = "";
	for (let index = 0; index < value.length; index++) {
		const character = value[index];
		if (escaped) {
			result += quote ? " " : character;
			escaped = false;
			continue;
		}
		if (character === "\\") {
			escaped = true;
			result += quote ? " " : character;
			continue;
		}
		if (quote) {
			if (character === quote) quote = null;
			result += " ";
			continue;
		}
		if (character === '"' || (character === "'" && isSingleQuoteDelimiter(value, index))) {
			quote = character;
			result += " ";
			continue;
		}
		result += character;
	}
	return result;
}

export function extractIdentifiers(
	value: string,
	knownSymbols: readonly string[] = [],
): string[] {
	const stripped = stripQuotedText(value);
	const found: string[] = [];
	const occupied = new Array(stripped.length).fill(false) as boolean[];
	for (const symbol of [...knownSymbols].filter(Boolean).sort((a, b) => b.length - a.length)) {
		let cursor = 0;
		while (cursor < stripped.length) {
			const index = stripped.toLocaleLowerCase().indexOf(symbol.toLocaleLowerCase(), cursor);
			if (index < 0) break;
			const before = stripped[index - 1];
			const after = stripped[index + symbol.length];
			const bounded = (!before || !/[\p{L}\p{N}_]/u.test(before)) &&
				(!after || !/[\p{L}\p{N}_]/u.test(after));
			if (bounded && !occupied.slice(index, index + symbol.length).some(Boolean)) {
				found.push(symbol.trim());
				for (let i = index; i < index + symbol.length; i++) occupied[i] = true;
			}
			cursor = index + Math.max(symbol.length, 1);
		}
	}
	const remaining = [...stripped]
		.map((character, index) => occupied[index] ? " " : character)
		.join("");
	for (const match of remaining.matchAll(/[\p{L}_][\p{L}\p{N}_]*/gu)) {
		const word = match[0];
		if (!KEYWORDS.has(word.toLocaleUpperCase())) found.push(word);
	}
	return [...new Set(found.map((name) => name.trim()).filter(Boolean))];
}

export function inferLiteralType(value: string | undefined): InferredType {
	if (!value) return "unknown";
	const text = value.trim();
	if (/^(?:true|false|vrai|faux)$/iu.test(text)) return "boolean";
	if (/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/u.test(text)) return "number";
	if (/^'(?:[^'\\]|\\.)'$/u.test(text)) return "character";
	if (/^"(?:[^"\\]|\\.)*"$/u.test(text) || /^'(?:[^'\\]|\\.){2,}'$/u.test(text)) return "string";
	return "unknown";
}

export function parseAssignment(
	value: string,
	knownSymbols: readonly string[] = [],
): ParsedAssignment {
	const text = value.trim();
	const operator = findTopLevelOperator(text, ["←", "<-", "->", "==", "="]);
	if (!operator) {
		return { isAssignment: false, valid: true, identifiers: [], inferredType: "unknown" };
	}
	const lhs = text.slice(0, operator.index).trim();
	const rhs = text.slice(operator.index + operator.operator.length).trim();
	const assignmentShaped = IDENTIFIER.test(lhs) && rhs.length > 0 && operator.operator !== "==";
	if (!assignmentShaped) {
		return {
			isAssignment: operator.operator !== "==",
			valid: false,
			lhs: lhs || undefined,
			rhs: rhs || undefined,
			operator: operator.operator,
			identifiers: extractIdentifiers(rhs, knownSymbols),
			inferredType: inferLiteralType(rhs),
		};
	}
	return {
		isAssignment: true,
		valid: operator.operator === "←" || operator.operator === "<-",
		lhs,
		rhs,
		operator: operator.operator,
		identifiers: extractIdentifiers(rhs, knownSymbols),
		inferredType: inferLiteralType(rhs),
	};
}

export function parseCondition(
	value: string,
	knownSymbols: readonly string[] = [],
): ParsedCondition {
	const text = value.trim();
	if (text.toLocaleLowerCase() === "sinon") {
		return { valid: true, isElse: true, usesDoubleEquals: false, identifiers: [], comparisons: [] };
	}
	if (!text) {
		return { valid: false, isElse: false, usesDoubleEquals: false, identifiers: [], comparisons: [] };
	}
	const stripped = stripQuotedText(text);
	const balanced = hasBalancedParentheses(stripped);
	const usesDoubleEquals = stripped.includes("==");
	const invalidLogical = /(?:\b(?:ET|OU)\b|&&|\|\|)\s*$/iu.test(stripped) ||
		/^\s*(?:\b(?:ET|OU)\b|&&|\|\|)/iu.test(stripped);
	const comparisons: ParsedComparison[] = [];
	for (const match of stripped.matchAll(COMPARISON)) {
		const leftStart = Math.max(
			stripped.lastIndexOf("&&", match.index),
			stripped.lastIndexOf("||", match.index),
			stripped.toLocaleUpperCase().lastIndexOf(" ET ", match.index),
			stripped.toLocaleUpperCase().lastIndexOf(" OU ", match.index),
		) + 1;
		const rightEndCandidates = [
			stripped.indexOf("&&", (match.index ?? 0) + match[0].length),
			stripped.indexOf("||", (match.index ?? 0) + match[0].length),
			stripped.toLocaleUpperCase().indexOf(" ET ", (match.index ?? 0) + match[0].length),
			stripped.toLocaleUpperCase().indexOf(" OU ", (match.index ?? 0) + match[0].length),
		].filter((index) => index >= 0);
		const rightEnd = rightEndCandidates.length ? Math.min(...rightEndCandidates) : stripped.length;
		const left = stripped.slice(leftStart, match.index).replace(/^[\s(]+|[\s)]+$/g, "").trim();
		const right = text.slice((match.index ?? 0) + match[0].length, rightEnd).replace(/^[\s(]+|[\s)]+$/g, "").trim();
		if (left && right) comparisons.push({ left, operator: match[0], right, rightType: inferLiteralType(right) });
	}
	const comparatorCount = [...stripped.matchAll(COMPARISON)].length;
	const valid = balanced && !invalidLogical && !usesDoubleEquals &&
		(comparatorCount === 0 || comparisons.length === comparatorCount);
	return {
		valid,
		isElse: false,
		usesDoubleEquals,
		identifiers: extractIdentifiers(text, knownSymbols),
		comparisons,
	};
}

export function normalizeAssignment(value: string): string {
	const operator = findTopLevelOperator(value, ["->", "="]);
	if (!operator) return value;
	return `${value.slice(0, operator.index).trim()} ← ${value.slice(operator.index + operator.operator.length).trim()}`;
}

export function normalizeComparison(value: string): string {
	return replaceOutsideQuotes(value, "==", "=");
}

export function areTypesCompatible(left: InferredType, right: InferredType): boolean {
	return left === "unknown" || right === "unknown" || left === right ||
		((left === "character" || left === "string") && (right === "character" || right === "string"));
}

export function dictionaryTypeToInferred(value: string | undefined): InferredType {
	if (!value) return "unknown";
	const normalized = value.toLocaleLowerCase();
	if (normalized.includes("bool")) return "boolean";
	if (normalized.includes("caractère") && !normalized.includes("chaine")) return "character";
	if (normalized.includes("chaine") || normalized.includes("chaîne")) return "string";
	if (normalized.includes("entier") || normalized.includes("décimal") || normalized.includes("nombre")) return "number";
	return "unknown";
}

function hasBalancedParentheses(value: string): boolean {
	let depth = 0;
	for (const character of value) {
		if (character === "(") depth++;
		if (character === ")" && --depth < 0) return false;
	}
	return depth === 0;
}

function findTopLevelOperator(value: string, operators: readonly string[]): { operator: string; index: number } | undefined {
	let quote: "'" | '"' | null = null;
	let depth = 0;
	for (let index = 0; index < value.length; index++) {
		const character = value[index];
		if (quote) {
			if (character === quote && value[index - 1] !== "\\") quote = null;
			continue;
		}
		if (character === '"' || (character === "'" && isSingleQuoteDelimiter(value, index))) { quote = character; continue; }
		if (character === "(") { depth++; continue; }
		if (character === ")") { depth--; continue; }
		if (depth !== 0) continue;
		const operator = operators.find((candidate) => value.startsWith(candidate, index));
		if (operator) return { operator, index };
	}
	return undefined;
}

function replaceOutsideQuotes(value: string, search: string, replacement: string): string {
	let quote: "'" | '"' | null = null;
	let result = "";
	for (let index = 0; index < value.length;) {
		const character = value[index];
		if (quote) {
			result += character;
			if (character === quote && value[index - 1] !== "\\") quote = null;
			index++;
			continue;
		}
		if (character === '"' || (character === "'" && isSingleQuoteDelimiter(value, index))) {
			quote = character;
			result += character;
			index++;
			continue;
		}
		if (value.startsWith(search, index)) {
			result += replacement;
			index += search.length;
			continue;
		}
		result += character;
		index++;
	}
	return result;
}

function isSingleQuoteDelimiter(value: string, index: number): boolean {
	const previous = value[index - 1];
	const next = value[index + 1];
	return !(previous && next && /\p{L}/u.test(previous) && /\p{L}/u.test(next));
}
