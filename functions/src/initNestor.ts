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
} from './TradingCards';
import {
    activities,
    listBooks,
    listGames,
    nowReading,
    nowPlaying,
    removeActivity,
} from './Activities';
import { nlpMiddleware } from './NLP';

export const HELP_COPY = `
I can help you manage your Trading Cards Collections.

Use the following commands if you need me.

*Collections*
_/newCollection [name] [# of cards]_ – create a new Collection
(Example: \`/newCollection Animales 276\`)
_/getCollections_ – list all Collections
(Example: \`/getCollections\`)

*Albums*
_/newAlbum [collection]_ – create an Album for a Collection
(Example: \`/newAlbum Animales\`)
_/newAlbum [collection] with [user]_ – create a collaborative Album for a Collection
(Example: \`/newAlbum Animales with JohnSmith\`)

*Cards*
_/addCards [collection] [list of cards]_ – add cards to an Album
(Example: \`/addCards Animales 1 5 9\`)
_/dealCards [collection] [list of cards]_ - remove cards from an Album
(Example: \`/dealCards Animales 3 6 7\`)
_/tengui [collection]_ – get own cards
(Example: \`/tengui Animales\`)
_/falti [collection]_ – get missing cards
(Example: \`/falti Animales\`)
_/repes [collection]_ – get repeated cards
(Example: \`/repes Animales\`)
_/count [collection]_ – get stats for your album
(Example: \`/count Animales\`)

*Activities*
_/activities_ – see current activities
_/listBooks_ – see current books
_/listGames_ – see current games
_/nowReading [title] by [author]_ – add a book
(Example: \`/nowReading Ready Player One by Ernest Cline\`)
_/nowPlaying [title] on [platform]_ – add a game
(Example: \`/nowPlaying The Legend of Zelda on Nintendo Switch\`)
_/removeActivity [title]_ – remove an activity
(Example: \`/removeActivity Ready Player One\`)
`;

export const initNestor = (bot: any) => {
    bot.start((ctx: any) => {
        if (!ctx.message.from.username) return;
        if (!ctx.message.from.first_name) return;

        ctx.reply(`Welcome ${ctx.message.from.username}`);
    });

    bot.help((ctx: any) => {
        ctx.replyWithMarkdown(HELP_COPY);
    });

    bot.command('newCollection', newCollection);

    bot.command('getCollections', getCollections);

    bot.command('newAlbum', newAlbum);

    bot.command('addCards', addCards);

    bot.command('dealCards', dealCards);

    bot.command('tengui', tengui);

    bot.command('falti', falti);

    bot.command('repes', repes);

    bot.command('count', count);

    bot.command('activities', activities);

    bot.command('listBooks', listBooks);

    bot.command('listGames', listGames);

    bot.command('nowReading', nowReading);

    bot.command('nowPlaying', nowPlaying);

    bot.command('removeActivity', removeActivity);

    bot.command('health', (ctx: any) => ctx.reply('I am ok!'));

    bot.on('message', nlpMiddleware);
};

module.exports = {
    initNestor,
};
