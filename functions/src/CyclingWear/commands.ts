import { generateCyclingWearAdvice } from './advisor';
import { getCyclingProfilePath, loadCyclingProfile } from './profile';
import { detectRequestLanguage, SupportedLanguage } from './language';

export const cyclingWear = async (ctx: any) => {
    console.log('[COMMANDS] - cyclingWear');

    const originalText = ctx.message.text ?? '';
    const forecastRequest = ctx.message.text
        .replace(/^\/cyclingWear(?:@\w+)?\s*/i, '')
        .trim();
    const language = detectRequestLanguage(forecastRequest || originalText);

    if (!forecastRequest) {
        ctx.reply(getUsageMessage(language));
        return;
    }

    try {
        const profile = loadCyclingProfile();
        const advice = await generateCyclingWearAdvice(
            profile,
            forecastRequest,
            language
        );

        ctx.reply(advice);
    } catch (error) {
        console.error(error);

        const message = error instanceof Error ? error.message : '';

        if (message.startsWith('Missing cycling profile file')) {
            ctx.reply(
                getMissingProfileMessage(language, getCyclingProfilePath())
            );
            return;
        }

        if (message.includes('Cycling profile')) {
            ctx.reply(getInvalidProfileMessage(language));
            return;
        }

        ctx.reply(getGenericErrorMessage(language));
    }
};

function getUsageMessage(language: SupportedLanguage | null): string {
    switch (language) {
    case 'es':
        return [
            'Uso: /cyclingWear <prevision y detalles de la ruta>',
            [
                'Ejemplo: /cyclingWear Salida manana a las 08:00, 7C',
                'subiendo a 15C, viento de 20 km/h, seco, 2h con',
                'desnivel.',
            ].join(' '),
        ].join('\n');
    case 'ca':
        return [
            'Us: /cyclingWear <previsio i detalls de la ruta>',
            [
                'Exemple: /cyclingWear Sortida dema a les 08:00, 7C',
                'pujant fins a 15C, vent de 20 km/h, sec, 2h amb',
                'desnivell.',
            ].join(' '),
        ].join('\n');
    default:
        return [
            'Usage: /cyclingWear <forecast and route details>',
            'Example: /cyclingWear Tomorrow 08:00 start, 7C rising to 15C, 20 km/h wind, dry, 2h hilly ride.',
        ].join('\n');
    }
}

function getMissingProfileMessage(
    language: SupportedLanguage | null,
    profilePath: string
): string {
    switch (language) {
    case 'es':
        return [
            [
                'Puedo ayudarte con la equipacion cuando mi perfil de',
                'ciclismo este configurado.',
            ].join(' '),
            `Perfil esperado: ${profilePath}`,
            [
                'Usa el archivo de ejemplo y el prompt de',
                'docs/cycling-profile-prompt.md para generarlo.',
            ].join(' '),
        ].join('\n');
    case 'ca':
        return [
            [
                'Et puc ajudar amb l\'equipacio quan el meu perfil de',
                'ciclisme estigui configurat.',
            ].join(' '),
            `Perfil esperat: ${profilePath}`,
            [
                'Fes servir el fitxer d\'exemple i el prompt de',
                'docs/cycling-profile-prompt.md per generar-lo.',
            ].join(' '),
        ].join('\n');
    default:
        return [
            'I can help with ride kit once my cycling profile is set up.',
            `Expected profile: ${profilePath}`,
            'Use the example file plus the prompt in docs/cycling-profile-prompt.md to generate it.',
        ].join('\n');
    }
}

function getInvalidProfileMessage(
    language: SupportedLanguage | null
): string {
    switch (language) {
    case 'es':
        return [
            'He encontrado el perfil de ciclismo, pero todavia no es valido.',
            [
                'Comprueba que sea JSON valido y que cada prenda tenga',
                '"name" y "category".',
            ].join(' '),
        ].join('\n');
    case 'ca':
        return [
            'He trobat el perfil de ciclisme, pero encara no es valid.',
            [
                'Comprova que sigui JSON valid i que cada peca tingui',
                '"name" i "category".',
            ].join(' '),
        ].join('\n');
    default:
        return [
            'I found the cycling profile file, but it is not valid yet.',
            'Check that it is valid JSON and that wardrobe items include "name" and "category".',
        ].join('\n');
    }
}

function getGenericErrorMessage(
    language: SupportedLanguage | null
): string {
    switch (language) {
    case 'es':
        return 'Ha habido un error al preparar la recomendacion para la ruta.';
    case 'ca':
        return 'Hi ha hagut un error en preparar la recomanacio per a la sortida.';
    default:
        return 'There was an error while preparing your ride kit.';
    }
}
