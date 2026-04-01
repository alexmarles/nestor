import { parseIntent } from './parseIntent';
import { routeIntent } from './router';

export async function nlpMiddleware(ctx: any): Promise<void> {
    const message = extractProcessableMessage(ctx);

    if (!message) return;

    try {
        console.log(`[NLP] Processing: "${message.text}"`);
        const parsed = await parseIntent(message.text);
        console.log(`[NLP] Parsed: ${JSON.stringify(parsed)}`);

        if (message.debug) {
            await ctx.reply(formatDebugMessage(parsed));
        }

        await routeIntent(ctx, parsed);
    } catch (error) {
        console.error('[NLP] Error:', error);
        ctx.reply(
            'I had trouble understanding that. Try using a /command instead.'
        );
    }
}

function extractProcessableMessage(
    ctx: any
): { text: string; debug: boolean } | null {
    const message = ctx.message;
    if (!message?.text) return null;

    const text = message.text;

    if (text.startsWith('/')) return null;

    const chatType = ctx.chat?.type;

    if (chatType === 'private') {
        return normalizeDebugOption(text);
    }

    if (chatType === 'group' || chatType === 'supergroup') {
        const botUsername = ctx.botInfo?.username;
        if (!botUsername) return null;

        const mentionRegex = new RegExp(`@${botUsername}\\b`, 'gi');
        if (!mentionRegex.test(text)) return null;

        return normalizeDebugOption(
            text.replace(new RegExp(`@${botUsername}\\b`, 'gi'), '').trim()
        );
    }

    return null;
}

function normalizeDebugOption(
    text: string
): { text: string; debug: boolean } | null {
    const debugRegex = /(?:^|\s)-debug(?:\s|$)/gi;
    const debug = debugRegex.test(text);
    const normalizedText = text.replace(debugRegex, ' ').trim();

    if (!normalizedText) return null;

    return {
        text: normalizedText,
        debug,
    };
}

function formatDebugMessage(parsed: {
    intent: string;
    params: Record<string, any>;
    confidence: number;
}): string {
    return [
        '[DEBUG]',
        `intent: ${parsed.intent}`,
        `confidence: ${parsed.confidence}`,
        `params: ${JSON.stringify(parsed.params)}`,
    ].join('\n');
}
