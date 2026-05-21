import { generateCyclingWearAdvice } from './advisor';
import { getCyclingProfilePath, loadCyclingProfile } from './profile';

const CYCLING_WEAR_USAGE = [
    'Usage: /cyclingWear <forecast and route details>',
    'Example: /cyclingWear Tomorrow 08:00 start, 7C rising to 15C, 20 km/h wind, dry, 2h hilly ride.',
].join('\n');

export const cyclingWear = async (ctx: any) => {
    console.log('[COMMANDS] - cyclingWear');

    const forecastRequest = ctx.message.text
        .replace(/^\/cyclingWear(?:@\w+)?\s*/i, '')
        .trim();

    if (!forecastRequest) {
        ctx.reply(CYCLING_WEAR_USAGE);
        return;
    }

    try {
        const profile = loadCyclingProfile();
        const advice = await generateCyclingWearAdvice(
            profile,
            forecastRequest
        );

        ctx.reply(advice);
    } catch (error) {
        console.error(error);

        const message = error instanceof Error ? error.message : '';

        if (message.startsWith('Missing cycling profile file')) {
            ctx.reply(
                [
                    'I can help with ride kit once my cycling profile is set up.',
                    `Expected profile: ${getCyclingProfilePath()}`,
                    'Use the example file plus the prompt in docs/cycling-profile-prompt.md to generate it.',
                ].join('\n')
            );
            return;
        }

        if (message.includes('Cycling profile')) {
            ctx.reply(
                [
                    'I found the cycling profile file, but it is not valid yet.',
                    'Check that it is valid JSON and that wardrobe items include "name" and "category".',
                ].join('\n')
            );
            return;
        }

        ctx.reply('There was an error while preparing your ride kit.');
    }
};
