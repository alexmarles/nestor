const BULLET_PREFIX_REGEX = /^[-*•]\s+/u;
const NUMBERED_PREFIX_REGEX = /^(\d+)\.\s+/u;
const MAX_HEADING_LENGTH = 60;

export function formatCyclingTelegramMessage(text: string): string {
    return text
        .split(/\r?\n/u)
        .map((line) => formatLine(line))
        .join('\n');
}

function formatLine(line: string): string {
    const trimmed = line.trim();

    if (!trimmed) return '';

    if (isHeading(trimmed)) {
        return `<b>${escapeHtml(trimmed)}</b>`;
    }

    if (BULLET_PREFIX_REGEX.test(trimmed)) {
        return `• ${escapeHtml(trimmed.replace(BULLET_PREFIX_REGEX, ''))}`;
    }

    const numberedMatch = trimmed.match(NUMBERED_PREFIX_REGEX);

    if (numberedMatch) {
        return `${numberedMatch[1]}. ${escapeHtml(
            trimmed.replace(NUMBERED_PREFIX_REGEX, '')
        )}`;
    }

    return escapeHtml(trimmed);
}

function isHeading(line: string): boolean {
    if (!line.endsWith(':')) return false;

    const content = line.slice(0, -1).trim();

    if (!content) return false;

    return content.length <= MAX_HEADING_LENGTH;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
