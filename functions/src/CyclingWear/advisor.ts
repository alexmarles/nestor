import Anthropic from '@anthropic-ai/sdk';

import { CyclingForecastImage } from './image';
import { SupportedLanguage } from './language';
import {
    CyclingItemTranslations,
    CyclingProfile,
    CyclingWardrobeItem,
} from './types';

const client = new Anthropic();
const MODEL = 'claude-haiku-4-5-20251001';

export async function generateCyclingWearAdvice(
    profile: CyclingProfile,
    forecastRequest: string,
    language?: SupportedLanguage | null,
    forecastImage?: CyclingForecastImage | null
): Promise<string> {
    const response = await client.messages.create({
        model: MODEL,
        max_tokens: 500,
        temperature: 0.3,
        system: buildSystemPrompt(profile, language, Boolean(forecastImage)),
        messages: [
            {
                role: 'user',
                content: buildUserContent(forecastRequest, forecastImage),
            },
        ],
    });

    const firstBlock = response.content[0];
    const text = firstBlock?.type === 'text' ? firstBlock.text.trim() : '';

    if (!text) {
        throw new Error('Empty response from cycling wear advisor.');
    }

    return text;
}

function buildSystemPrompt(
    profile: CyclingProfile,
    language?: SupportedLanguage | null,
    hasForecastImage?: boolean
): string {
    const languageInstruction = getLanguageInstruction(language);
    const responseProfile = buildProfileForResponse(profile, language);
    const imageInstruction = hasForecastImage ?
        [
            'The user has attached a weather or route screenshot.',
            'Read the image carefully and extract useful forecast details',
            'before making the recommendation.',
            'If the image is not readable or is not a weather forecast, ask',
            'exactly one short follow-up question.',
        ].join(' ') :
        'The user may describe the forecast directly in text.';

    return [
        'You are a cycling clothing advisor for a Telegram bot.',
        [
            'Your job is to recommend what the rider should wear for a',
            'specific ride based on the stored rider profile and the',
            'forecast/request sent by the user.',
        ].join(' '),
        [
            'Treat the profile JSON as the source of truth for what the',
            'rider owns, their preferences, and their personal rules.',
        ].join(' '),
        [
            'Never recommend an item that is not present in the wardrobe',
            'or explicitly referenced elsewhere in the profile.',
        ].join(' '),
        [
            'If two setups are plausible, prefer the slightly safer one',
            'and mention the lighter alternative in one short line.',
        ].join(' '),
        languageInstruction,
        imageInstruction,
        [
            'When you mention a wardrobe item in your answer, use its',
            '"displayName" exactly as written in the profile JSON for this',
            'reply.',
        ].join(' '),
        [
            'Do not use Markdown, HTML, code fences, or tables.',
            'Use plain text only.',
        ].join(' '),
        'If the forecast is incomplete, make the smallest reasonable assumption and state it briefly.',
        'Keep the answer concise and practical.',
        'Use this 3-part structure with headings localized to the reply language:',
        'Riding kit:',
        '- item',
        '',
        'Pack:',
        '- item',
        '',
        'Why:',
        '- short reason',
        '',
        [
            'If the forecast is too vague to give a useful answer, ask',
            'exactly one short follow-up question instead.',
        ].join(' '),
        '',
        'Cycling profile JSON for this reply:',
        JSON.stringify(responseProfile, null, 2),
    ].join('\n');
}

function getLanguageInstruction(
    language?: SupportedLanguage | null
): string {
    switch (language) {
    case 'es':
        return 'Reply in Spanish.';
    case 'ca':
        return 'Reply in Catalan.';
    case 'en':
        return 'Reply in English.';
    default:
        return [
            'Reply in the same language as the user request.',
            'Support English, Spanish, and Catalan.',
        ].join(' ');
    }
}

function buildProfileForResponse(
    profile: CyclingProfile,
    language?: SupportedLanguage | null
): Record<string, unknown> {
    return {
        ...profile,
        wardrobe: profile.wardrobe.map((item) => ({
            ...item,
            displayName: getLocalizedItemName(item, language),
        })),
    };
}

function getLocalizedItemName(
    item: CyclingWardrobeItem,
    language?: SupportedLanguage | null
): string {
    if (!language) return item.name;

    return getTranslation(item.translations, language) ?? item.name;
}

function getTranslation(
    translations: CyclingItemTranslations | undefined,
    language: SupportedLanguage
): string | undefined {
    if (!translations) return undefined;

    const translated = translations[language];
    return translated?.trim() || undefined;
}

function buildUserContent(
    forecastRequest: string,
    forecastImage?: CyclingForecastImage | null
): Anthropic.MessageParam['content'] {
    const content: Exclude<Anthropic.MessageParam['content'], string> = [];

    if (forecastImage) {
        content.push({
            type: 'image',
            source: {
                type: 'base64',
                media_type: forecastImage.mediaType,
                data: forecastImage.data,
            },
        });
    }

    content.push({
        type: 'text',
        text: buildUserPrompt(forecastRequest, Boolean(forecastImage)),
    });

    return content;
}

function buildUserPrompt(
    forecastRequest: string,
    hasForecastImage: boolean
): string {
    const trimmedRequest = forecastRequest.trim();

    if (hasForecastImage && trimmedRequest) {
        return [
            'Use the attached screenshot as the main forecast source.',
            'Also use these extra notes from the user if they help:',
            trimmedRequest,
        ].join('\n\n');
    }

    if (hasForecastImage) {
        return [
            'Use the attached screenshot to extract the forecast and any',
            'route details you can infer.',
            'Then recommend what the rider should wear for the ride.',
        ].join(' ');
    }

    return trimmedRequest;
}
