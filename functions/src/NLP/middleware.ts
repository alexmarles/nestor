import { cyclingWear } from '../CyclingWear';
import { hasSupportedTelegramImage } from '../CyclingWear/image';
import {
    hasSupportedTelegramAudio,
    transcribeTelegramAudioMessage,
} from './audio';
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

        const requestText = message.kind === 'voice' ?
            await transcribeVoiceMessage(ctx, message.debug) :
            message.text;

        console.log(`[NLP] Processing: "${requestText}"`);
        const parsed = await parseIntent(requestText);
        console.log(`[NLP] Parsed: ${JSON.stringify(parsed)}`);

        if (message.debug) {
            await ctx.reply(
                formatDebugMessage(parsed, message.kind === 'voice' ?
                    requestText :
                    null)
            );
        }

        await routeIntent(ctx, parsed);
    } catch (error) {
        console.error('[NLP] Error:', error);

        if (message.kind === 'voice') {
            await ctx.reply(getVoiceErrorMessage(error));
            return;
        }

        await ctx.reply(
            'I had trouble understanding that. Try using a /command instead.'
        );
    }
}

function extractProcessableMessage(
    ctx: any
): { kind: 'text' | 'image' | 'voice'; text: string; debug: boolean } | null {
    const message = ctx.message;
    const chatType = ctx.chat?.type;
    const text = message?.text;
    const caption = message?.caption ?? '';
    const hasImage = hasSupportedTelegramImage(message);
    const hasAudio = hasSupportedTelegramAudio(message);

    if (hasImage) {
        if (chatType === 'private') {
            return normalizeDebugOption('image', caption, true);
        }

        if (chatType === 'group' || chatType === 'supergroup') {
            if (!isAddressedToBot(ctx, caption)) return null;

            return normalizeDebugOption(
                'image',
                stripBotMention(ctx, caption),
                true
            );
        }

        return null;
    }

    if (hasAudio) {
        if (chatType === 'private') {
            return normalizeDebugOption('voice', caption, true);
        }

        if (chatType === 'group' || chatType === 'supergroup') {
            if (!isAddressedToBot(ctx, caption)) return null;

            return normalizeDebugOption(
                'voice',
                stripBotMention(ctx, caption),
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
        if (!isAddressedToBot(ctx, text)) return null;

        return normalizeDebugOption(
            'text',
            stripBotMention(ctx, text),
            false
        );
    }

    return null;
}

function normalizeDebugOption(
    kind: 'text' | 'image' | 'voice',
    text: string,
    allowEmpty: boolean
): { kind: 'text' | 'image' | 'voice'; text: string; debug: boolean } | null {
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

async function transcribeVoiceMessage(
    ctx: any,
    debug: boolean
): Promise<string> {
    const transcript = await transcribeTelegramAudioMessage(ctx);

    console.log(`[NLP] Voice transcript: "${transcript}"`);

    if (debug) {
        await ctx.reply(
            [
                '[DEBUG]',
                `voice transcript: ${transcript}`,
            ].join('\n')
        );
    }

    return transcript;
}

function isAddressedToBot(ctx: any, text: string): boolean {
    const botId = ctx.botInfo?.id;
    const repliedUserId = ctx.message?.reply_to_message?.from?.id;

    if (botId && repliedUserId === botId) {
        return true;
    }

    const botUsername = ctx.botInfo?.username;

    if (!botUsername) return false;

    return new RegExp(`@${botUsername}\\b`, 'i').test(text);
}

function stripBotMention(ctx: any, text: string): string {
    const botUsername = ctx.botInfo?.username;

    if (!botUsername) return text.trim();

    return text.replace(new RegExp(`@${botUsername}\\b`, 'gi'), '').trim();
}

function formatDebugMessage(parsed: {
    intent: string;
    params: Record<string, any>;
    confidence: number;
}, transcript?: string | null): string {
    const lines = [
        '[DEBUG]',
        `intent: ${parsed.intent}`,
        `confidence: ${parsed.confidence}`,
        `params: ${JSON.stringify(parsed.params)}`,
    ];

    if (transcript) {
        lines.push(`transcript: ${transcript}`);
    }

    return lines.join('\n');
}

function getVoiceErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : '';

    if (message === 'Missing OpenAI transcription API key.') {
        return [
            'Voice transcription is not configured yet.',
            'Set OPENAI_API_KEY to let me understand voice messages.',
        ].join('\n');
    }

    if (message === 'Telegram audio file is too large for transcription.') {
        return [
            'That voice message is too large for me to transcribe.',
            'Try a shorter clip or send the request as text.',
        ].join('\n');
    }

    if (message === 'Unsupported Telegram audio type.') {
        return [
            'I could not read that audio format.',
            'Try sending a standard Telegram voice note or a short audio file.',
        ].join('\n');
    }

    return [
        'I could not transcribe that voice message.',
        'Try again or send the same request as text.',
    ].join('\n');
}
