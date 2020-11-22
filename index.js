const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');

const { Collection, Album } = require('./tradingCards');

dotenv.config();

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
const CHECK_HELP_COPY = 'Are you sure you are adding all the information? Check /help for examples.';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(ctx => {
    if (!ctx.message.from.username) return;
    if (!ctx.message.from.first_name) return;

    ctx.reply(`Welcome ${ctx.message.from.username}`);
});

bot.help(ctx => {
    ctx.replyWithMarkdown(HELP_COPY);
});

bot.command('/newCollection', ctx => {
    const [, name, numCards] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!name || !numCards || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Collection.create(name, parseInt(numCards), sender)
        .then(() => {
            ctx.replyWithMarkdown(
                `${senderFirstName}, I created the new *${name}* Collection for you.\n\nNow you can ask me to create an album using _/newAlbum ${name}_`
            );
        })
        .catch(() => {
            ctx.reply('There was an error, try again later.');
        });
});

bot.command('/newAlbum', ctx => {
    const [, collectionName] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Album.create(collectionName, sender)
        .then(() => {
            ctx.replyWithMarkdown(
                `${senderFirstName}, I created the new *${collectionName}* Album for you.\nNow you can ask me to add your cards using _/addCards ${collectionName} [list of cards]_`
            );
        })
        .catch(err => {
            ctx.reply('There was an error, try again later.');
        });
});

bot.command('/addCards', ctx => {
    const [, collectionName] = ctx.message.text.split(' ');
    const cards = ctx.message.text.split(' ').slice(2);
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Album.get(collectionName, sender)
        .then(async ({ found, album }) => {
            if (!found) {
                ctx.replyWithMarkdown(
                    `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
                );
            } else {
                console.log('[ALBUM/ADD CARDS] – Album retrieved');
                album
                    .addCards(cards)
                    .then((newCards) => {
                        console.log('[ALBUM/ADD CARDS] – Cards added');
                        ctx.replyWithMarkdown(
                            `${senderFirstName}, I added this new cards into your *${collectionName}* album:\n- ${newCards.join(
                                '\n- '
                            )}\nAlso, ${cards.length - newCards.length} cards are repeated and were already in your album.`
                        );
                    })
                    .catch(() => {
                        console.log('[ALBUM/ADD CARDS] – Error adding cards');
                        ctx.reply('There was an error, try again later.');
                    });
            }
        })
        .catch(() => {
            console.log('[ALBUM/ADD CARDS] – Error retrieving album');
            ctx.reply('There was an error, try again later.');
        });
});

bot.command('/tengui', ctx => {
    const [, collectionName] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Collection.get(collectionName)
        .then(collection => {
            Album.get(collectionName, sender)
                .then(async ({ found, album }) => {
                    if (!found) {
                        ctx.replyWithMarkdown(
                            `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
                        );
                    } else {
                        const result = await album.tengui();
                        const tengui = [];
                        for (card in result) {
                            tengui.push(`${card} (${result[card]})`);
                        }
                        const count = tengui.length;
                        if (count < 1) {
                            ctx.replyWithMarkdown(
                                `${senderFirstName}, you do not have *any* cards in your *${collectionName}* album. Start trading!`
                            );
                        } else if (count >= collection.getNumCards()) {
                            ctx.replyWithMarkdown(
                                `${senderFirstName}, you have *finished* your *${collectionName}* album. Congratulations!`
                            );
                        } else {
                            ctx.replyWithMarkdown(
                                `${senderFirstName}, you have *${count}* cards in your *${collectionName}* album:\n- ${tengui.join(
                                    '\n- '
                                )}`
                            );
                        }
                    }
                })
                .catch(() => {
                    ctx.reply('There was an error, try again later.');
                });
        })
        .catch(() => {
            ctx.reply('There was an error, try again later.');
        });
});

bot.command('/falti', ctx => {
    const [, collectionName] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Collection.get(collectionName)
        .then(collection => {
            Album.get(collectionName, sender)
                .then(async ({ found, album }) => {
                    if (!found) {
                        ctx.replyWithMarkdown(
                            `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
                        );
                    } else {
                        const falti = await album.falti();
                        const count = falti.length;
                        if (count >= collection.getNumCards()) {
                            ctx.replyWithMarkdown(
                                `${senderFirstName}, you do not have *any* cards in your *${collectionName}* album. Start trading!`
                            );
                        } else if (count < 1) {
                            ctx.replyWithMarkdown(
                                `${senderFirstName}, you have *finished* your *${collectionName}* album. Congratulations!`
                            );
                        } else {
                            ctx.replyWithMarkdown(
                                `${senderFirstName}, you need to find *${count}* more cards for your *${collectionName}* album:\n- ${falti.join(
                                    '\n- '
                                )}`
                            );
                        }
                    }
                })
                .catch(() => {
                    ctx.reply('There was an error, try again later.');
                });
        })
        .catch(() => {
            ctx.reply('There was an error, try again later.');
        });
});

bot.command('/repes', ctx => {
    const [, collectionName] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Album.get(collectionName, sender)
        .then(async ({ found, album }) => {
            if (!found) {
                ctx.replyWithMarkdown(
                    `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
                );
            } else {
                const result = await album.repes();
                const repes = [];
                for (card in result) {
                    repes.push(`${card} (${result[card]})`);
                }
                ctx.replyWithMarkdown(
                    `${senderFirstName}, you have *${
                        repes.length
                    }* repeated cards in your *${collectionName}* album:\n- ${repes.join(
                        '\n- '
                    )}`
                );
            }
        })
        .catch(() => {
            ctx.reply('There was an error, try again later.');
        });
});

bot.command('/count', ctx => {
    const [, collectionName] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Collection.get(collectionName)
        .then(collection => {
            Album.get(collectionName, sender)
                .then(async ({ found, album }) => {
                    if (!found) {
                        ctx.replyWithMarkdown(
                            `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
                        );
                    } else {
                        const tengui = await album.tengui();
                        const total = collection.getNumCards();
                        const count = Object.keys(tengui).length;
                        const missing = total - count;
                        ctx.replyWithMarkdown(
                            `${senderFirstName}, the Collection *${collectionName}* has a total of *${total}* cards.\nYou have got *${count}* cards so far.\nYou still need to find *${missing}* more cards to finish your album.`
                        );
                    }
                })
                .catch(() => {
                    ctx.reply('There was an error, try again later.');
                });
        })
        .catch(() => {
            ctx.reply('There was an error, try again later.');
        });
});

bot.launch();
