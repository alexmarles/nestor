import { cyclingWear } from '../CyclingWear';
import { hasSupportedTelegramImage } from '../CyclingWear/image';
import { parseIntent } from './parseIntent';
import { routeIntent } from './router';

export async function nlpMiddleware(ctx: any): Promise<void> {
    const message = extractProcessableMessage(ctx);

    if (!message) return;

    try {
        if (message.kind === 'image') {
            console.log(
                `[NLP] Processing image${message.text ? ` with caption: "${message.text}"` : ''}`
            );

            if (message.debug) {
                await ctx.reply(
                    formatDebugMessage({
                        intent: 'cyclingWear',
                        params: {
                            requestText: message.text,
                            hasImage: true,
                        },
                        confidence: 1,
                    })
                );
            }

            await cyclingWear(ctx);
            return;
        }

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
): { kind: 'text' | 'image'; text: string; debug: boolean } | null {
    const message = ctx.message;
    const chatType = ctx.chat?.type;
    const text = message?.text;
    const caption = message?.caption ?? '';
    const hasImage = hasSupportedTelegramImage(message);

    if (hasImage) {
        if (chatType === 'private') {
            return normalizeDebugOption('image', caption, true);
        }

        if (chatType === 'group' || chatType === 'supergroup') {
            const botUsername = ctx.botInfo?.username;
            if (!botUsername) return null;

            const mentionRegex = new RegExp(`@${botUsername}\\b`, 'gi');
            if (!mentionRegex.test(caption)) return null;

            return normalizeDebugOption(
                'image',
                caption.replace(new RegExp(`@${botUsername}\\b`, 'gi'), '').trim(),
                true
            );
        }

        return null;
    }

    if (!text) return null;

    if (text.startsWith('/')) return null;

    if (chatType === 'private') {
        return normalizeDebugOption('text', text, false);
    }

    if (chatType === 'group' || chatType === 'supergroup') {
        const botUsername = ctx.botInfo?.username;
        if (!botUsername) return null;

        const mentionRegex = new RegExp(`@${botUsername}\\b`, 'gi');
        if (!mentionRegex.test(text)) return null;

        return normalizeDebugOption(
            'text',
            text.replace(new RegExp(`@${botUsername}\\b`, 'gi'), '').trim(),
            false
        );
    }

    return null;
}

function normalizeDebugOption(
    kind: 'text' | 'image',
    text: string,
    allowEmpty: boolean
): { kind: 'text' | 'image'; text: string; debug: boolean } | null {
    const debugRegex = /(?:^|\s)-debug(?:\s|$)/gi;
    const debug = debugRegex.test(text);
    const normalizedText = text.replace(debugRegex, ' ').trim();

    if (!normalizedText && !allowEmpty) return null;

    return {
        kind,
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
