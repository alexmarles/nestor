import Anthropic from '@anthropic-ai/sdk';

import { CyclingProfile } from './types';

const client = new Anthropic();
const MODEL = 'claude-haiku-4-5-20251001';

export async function generateCyclingWearAdvice(
    profile: CyclingProfile,
    forecastRequest: string
): Promise<string> {
    const response = await client.messages.create({
        model: MODEL,
        max_tokens: 500,
        temperature: 0.3,
        system: buildSystemPrompt(profile),
        messages: [{ role: 'user', content: forecastRequest }],
    });

    const firstBlock = response.content[0];
    const text = firstBlock?.type === 'text' ? firstBlock.text.trim() : '';

    if (!text) {
        throw new Error('Empty response from cycling wear advisor.');
    }

    return text;
}

function buildSystemPrompt(profile: CyclingProfile): string {
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
        'If the forecast is incomplete, make the smallest reasonable assumption and state it briefly.',
        'Keep the answer concise and practical.',
        'Use this format:',
        'Ride kit:',
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
        'Cycling profile JSON:',
        JSON.stringify(profile, null, 2),
    ].join('\n');
}
