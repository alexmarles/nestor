export type SupportedLanguage = 'en' | 'es' | 'ca';

const CATALAN_PATTERNS = [
    /\bdema\b/u,
    /\bquina\b/u,
    /\bquines\b/u,
    /\bquins\b/u,
    /\bque em poso\b/u,
    /\bsortida\b/u,
    /\bpujada\b/u,
    /\bbaixada\b/u,
    /\bpluja\b/u,
    /\bmitjons\b/u,
    /\bguants\b/u,
    /\barmilla\b/u,
    /\bmallot\b/u,
    /\bculot\b/u,
];

const SPANISH_PATTERNS = [
    /\bmanana\b/u,
    /\bque me pongo\b/u,
    /\bropa\b/u,
    /\bsalida\b/u,
    /\bsubida\b/u,
    /\bbajada\b/u,
    /\blluvia\b/u,
    /\bcalcetines\b/u,
    /\bguantes\b/u,
    /\bchaleco\b/u,
    /\bmaillot\b/u,
    /\bculotte\b/u,
];

export function detectRequestLanguage(
    text: string
): SupportedLanguage | null {
    const normalized = normalizeText(text);

    const catalanScore = scorePatterns(normalized, CATALAN_PATTERNS);
    const spanishScore = scorePatterns(normalized, SPANISH_PATTERNS);

    if (catalanScore === 0 && spanishScore === 0) {
        return null;
    }

    if (catalanScore > spanishScore) {
        return 'ca';
    }

    if (spanishScore > catalanScore) {
        return 'es';
    }

    return null;
}

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function scorePatterns(text: string, patterns: RegExp[]): number {
    return patterns.reduce(
        (score, pattern) => score + (pattern.test(text) ? 1 : 0),
        0
    );
}
