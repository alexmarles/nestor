import {
    activities,
    listBooks,
    listGames,
    nowReading,
    nowPlaying,
    removeActivity,
} from '../Activities';
import {
    newCollection,
    getCollections,
    newAlbum,
    addCards,
    dealCards,
    tengui,
    falti,
    repes,
    count,
} from '../TradingCards';
import { HELP_COPY } from '../initNestor';
import { ParsedIntent } from './parseIntent';

type Handler = (ctx: any) => any;

interface RouteConfig {
    handler: Handler;
    buildCommandText: (params: Record<string, any>) => string;
}

const routes: Record<string, RouteConfig> = {
    activities: {
        handler: activities,
        buildCommandText: () => '/activities',
    },
    listBooks: {
        handler: listBooks,
        buildCommandText: () => '/listBooks',
    },
    listGames: {
        handler: listGames,
        buildCommandText: () => '/listGames',
    },
    nowReading: {
        handler: nowReading,
        buildCommandText: (p) => {
            let text = `/nowReading ${p.title}`;
            if (p.author) text += ` by ${p.author}`;
            return text;
        },
    },
    nowPlaying: {
        handler: nowPlaying,
        buildCommandText: (p) => {
            let text = `/nowPlaying ${p.title}`;
            if (p.platform) text += ` on ${p.platform}`;
            return text;
        },
    },
    removeActivity: {
        handler: removeActivity,
        buildCommandText: (p) => `/removeActivity ${p.title}`,
    },
    newCollection: {
        handler: newCollection,
        buildCommandText: (p) => `/newCollection ${p.name} ${p.numCards}`,
    },
    getCollections: {
        handler: getCollections,
        buildCommandText: () => '/getCollections',
    },
    newAlbum: {
        handler: newAlbum,
        buildCommandText: (p) => {
            let text = `/newAlbum ${p.collectionName}`;
            if (p.collaborators?.length) {
                text += ` with ${p.collaborators.join(' ')}`;
            }
            return text;
        },
    },
    addCards: {
        handler: addCards,
        buildCommandText: (p) =>
            `/addCards ${p.collectionName} ${p.cards.join(' ')}`,
    },
    dealCards: {
        handler: dealCards,
        buildCommandText: (p) =>
            `/dealCards ${p.collectionName} ${p.cards.join(' ')}`,
    },
    tengui: {
        handler: tengui,
        buildCommandText: (p) => `/tengui ${p.collectionName}`,
    },
    falti: {
        handler: falti,
        buildCommandText: (p) => `/falti ${p.collectionName}`,
    },
    repes: {
        handler: repes,
        buildCommandText: (p) => `/repes ${p.collectionName}`,
    },
    count: {
        handler: count,
        buildCommandText: (p) => `/count ${p.collectionName}`,
    },
    help: {
        handler: (ctx: any) => ctx.reply(HELP_COPY),
        buildCommandText: () => '/help',
    },
    health: {
        handler: (ctx: any) => ctx.reply('I am ok!'),
        buildCommandText: () => '/health',
    },
};

export async function routeIntent(
    ctx: any,
    parsed: ParsedIntent
): Promise<void> {
    const route = routes[parsed.intent];

    if (!route || parsed.intent === 'unknown' || parsed.confidence < 0.6) {
        ctx.reply(
            'I didn\'t quite understand that. Try /help to see what I can do.'
        );
        return;
    }

    const commandText = route.buildCommandText(parsed.params);
    ctx.update.message.text = commandText;

    await route.handler(ctx);
}
