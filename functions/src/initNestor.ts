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
    // update,
} from './TradingCards';

const HELP_COPY = `
I can help you manage your Trading Cards Collections.

Use the following commands if you need me.

*Collections*
_/newCollection [name] [# of cards]_ – create a new Collection
(Example: \`/newCollection Animales 276\`)
_/getCollections – list all Collections
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
`;

export const initNestor = (bot: any) => {
    bot.start((ctx: any) => {
        if (!ctx.message.from.username) return;
        if (!ctx.message.from.first_name) return;

        ctx.reply(`Welcome ${ctx.message.from.username}`);
    });

    bot.help((ctx: any) => {
        ctx.reply(HELP_COPY);
    });

    bot.command('newCollection', newCollection);

    bot.command('getCollections', getCollections);

    bot.command('newAlbum', newAlbum);

    bot.command('addCards', addCards);

    bot.command('deal', dealCards);

    bot.command('tengui', tengui);

    bot.command('falti', falti);

    bot.command('repes', repes);

    bot.command('count', count);

    // bot.command('update', update);

    bot.command('health', (ctx: any) => ctx.reply('I am ok!'));

    // Echo
    bot.on('message', (ctx: any) => ctx.copyMessage(ctx.chat.id, ctx.message));
};

module.exports = {
    initNestor,
};
