import { parseIntent } from './parseIntent';
import { routeIntent } from './router';

export async function nlpMiddleware(ctx: any): Promise<void> {
    const text = extractProcessableText(ctx);

    if (!text) return;

    try {
        console.log(`[NLP] Processing: "${text}"`);
        const parsed = await parseIntent(text);
        console.log(`[NLP] Parsed: ${JSON.stringify(parsed)}`);
        await routeIntent(ctx, parsed);
    } catch (error) {
        console.error('[NLP] Error:', error);
        ctx.reply(
            'I had trouble understanding that. Try using a /command instead.'
        );
    }
}

function extractProcessableText(ctx: any): string | null {
    const message = ctx.message;
    if (!message?.text) return null;

    const text = message.text;

    if (text.startsWith('/')) return null;

    const chatType = ctx.chat?.type;

    if (chatType === 'private') {
        return text;
    }

    if (chatType === 'group' || chatType === 'supergroup') {
        const botUsername = ctx.botInfo?.username;
        if (!botUsername) return null;

        const mentionRegex = new RegExp(`@${botUsername}\\b`, 'gi');
        if (!mentionRegex.test(text)) return null;

        return text
            .replace(new RegExp(`@${botUsername}\\b`, 'gi'), '')
            .trim();
    }

    return null;
}
