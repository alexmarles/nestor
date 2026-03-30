import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './systemPrompt';

export interface ParsedIntent {
    intent: string;
    params: Record<string, any>;
    confidence: number;
}

const client = new Anthropic();

export async function parseIntent(userMessage: string): Promise<ParsedIntent> {
    const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
    });

    const raw = response.content[0].type === 'text' ?
        response.content[0].text : '';
    const text = raw.replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(text) as ParsedIntent;
}
