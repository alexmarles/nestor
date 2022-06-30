require('dotenv/config');
const { Telegraf } = require('telegraf');

const {
    newCollection,
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

*Albums*
_/newAlbum [collection]_ – create an Album for a Collection
(Example: \`/newAlbum Animales\`)

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

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(ctx => {
    if (!ctx.message.from.username) return;
    if (!ctx.message.from.first_name) return;

    ctx.reply(`Welcome ${ctx.message.from.username}`);
});

bot.help(ctx => {
    ctx.replyWithMarkdown(HELP_COPY);
});

bot.command('/newCollection', newCollection);

bot.command('/newAlbum', newAlbum);

bot.command('/addCards', addCards);

bot.command('/tengui', tengui);

bot.command('/falti', falti);

bot.command('/repes', repes);

bot.command('/count', count);

bot.command('/update', update);

bot.launch();

exports.handler = async event => {
    try {
        await bot.handleUpdate(JSON.parse(event.body));
        return { statusCode: 200, body: '' };
    } catch (e) {
        console.log(e);
        return {
            statusCode: 400,
            body: 'This endpoint is meant for bot and telegram communication',
        };
    }
};
