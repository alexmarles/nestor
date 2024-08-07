const {
    newCollection,
    getCollections,
    newAlbum,
    addCards,
    tengui,
    falti,
    repes,
    count,
    update,
} = require('./TradingCards');

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
_/tengui [collection]_ – get own cards
(Example: \`/tengui Animales\`)
_/falti [collection]_ – get missing cards
(Example: \`/falti Animales\`)
_/repes [collection]_ – get repeated cards
(Example: \`/repes Animales\`)
_/count [collection]_ – get stats for your album
(Example: \`/count Animales\`)
`;

const initNestor = bot => {
    bot.start(ctx => {
        if (!ctx.message.from.username) return;
        if (!ctx.message.from.first_name) return;

        ctx.reply(`Welcome ${ctx.message.from.username}`);
    });

    bot.help(ctx => {
        ctx.reply(HELP_COPY);
    });

    bot.command('newCollection', newCollection);

    bot.command('getCollections', getCollections);

    bot.command('newAlbum', newAlbum);

    bot.command('addCards', addCards);

    bot.command('tengui', tengui);

    bot.command('falti', falti);

    bot.command('repes', repes);

    bot.command('count', count);

    bot.command('update', update);

    bot.command('health', ctx => ctx.reply('I am ok!'));

    // Echo
    bot.on('message', ctx => ctx.copyMessage(ctx.chat.id, ctx.message));

    bot.launch();
};

module.exports = {
    initNestor,
};
