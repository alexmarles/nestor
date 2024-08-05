/* eslint-disable max-len */
import { Collection } from './Collection';
import { Album } from './Album';

const CHECK_HELP_COPY =
    'Are you sure you are adding all the information? Check /help for examples.';

export const newCollection = (ctx: any) => {
    console.log('[COMMANDS] – newCollection');
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
};

export const getCollections = (ctx: any) => {
    console.log('[COMMANDS] – getCollections');

    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Collection.getAll()
        .then((result: any) => {
            console.log(result);
            ctx.replyWithMarkdown(
                `${senderFirstName}, these are all the available Collections:\n\n- ${result
                    .map((c: any) => c._name)
                    .join('\n- ')}`
            );
        })
        .catch((error) => {
            console.error(error);
            ctx.reply('There was an error, try again later.');
        });
};

export const newAlbum = (ctx: any) => {
    console.log('[COMMANDS] – newAlbum');
    const [, collectionName, after, ...collabs] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    if (after === 'with' && collabs.length > 0) {
        Album.createCollaborative(collectionName, sender, collabs)
            .then(() => {
                ctx.replyWithMarkdown(
                    `${senderFirstName}, I created the new *${collectionName}* collaborative Album for ${collabs.join(
                        ', '
                    )} and you.\nNow you can ask me to add your cards using _/addCards ${collectionName} [list of cards]_`
                );
            })
            .catch((error) => {
                console.error(error);
                ctx.reply('There was an error, try again later.');
            });
    } else {
        Album.create(collectionName, sender)
            .then(() => {
                ctx.replyWithMarkdown(
                    `${senderFirstName}, I created the new *${collectionName}* Album for you.\nNow you can ask me to add your cards using _/addCards ${collectionName} [list of cards]_`
                );
            })
            .catch((error) => {
                console.error(error);
                ctx.reply('There was an error, try again later.');
            });
    }
};

export const addCards = (ctx: any) => {
    console.log('[COMMANDS] – addCards');
    const [, collectionName] = ctx.message.text.split(' ');
    const cards = ctx.message.text.split(' ').slice(2);
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Album.get(collectionName, sender)
        .then(async ({ found, album }: any) => {
            if (!found) {
                ctx.replyWithMarkdown(
                    `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
                );
            } else {
                console.log('[ALBUM/ADD CARDS] – Album retrieved');
                album
                    .addCards(cards)
                    .then(({ newCards, repes, newRepes }: any) => {
                        console.log('[ALBUM/ADD CARDS] – Cards added');

                        const addedText =
                            newCards.size > 0 ?
                                `${senderFirstName}, I added *${
                                    newCards.size
                                }* new cards into your *${collectionName}* album 😀\n- ${[
                                    ...newCards,
                                ].join('\n- ')}` :
                                `${senderFirstName}, there were no new cards in this batch 😢.`;
                        const newRepesText =
                            newRepes.size > 0 ?
                                `There were *${
                                    newRepes.size
                                }* duplicated cards in this batch 😕\n- ${[
                                    ...newRepes,
                                ].join('\n- ')}` :
                                'There were no duplicates in this batch! 😄';
                        const repesText =
                            repes.size > 0 ?
                                `And *${
                                    repes.size
                                }* cards were already in your album 😫\n- ${[
                                    ...repes,
                                ].join('\n- ')}` :
                                'None of the added cards were already in your album! 🥳';
                        const texts =
                            newCards.size > 0 ?
                                [addedText, newRepesText, repesText] :
                                [addedText, repesText];
                        ctx.replyWithMarkdown(texts.join('\n\n'));
                    })
                    .catch((error: any) => {
                        console.log('[ALBUM/ADD CARDS] – Error adding cards');
                        console.error(error);
                        ctx.reply('There was an error, try again later.');
                    });
            }
        })
        .catch((error) => {
            console.log('[ALBUM/ADD CARDS] – Error retrieving album');
            console.error(error);
            ctx.reply('There was an error, try again later.');
        });
};

export const dealCards = (ctx: any) => {
    console.log('[COMMANDS] – dealCards');
    const [, collectionName] = ctx.message.text.split(' ');
    const cards = ctx.message.text.split(' ').slice(2);
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Album.get(collectionName, sender)
        .then(async ({ found, album }: any) => {
            if (!found) {
                ctx.replyWithMarkdown(
                    `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
                );
            } else {
                console.log('[ALBUM/DEAL CARDS] – Album retrieved');
                album
                    .dealCards(cards)
                    .then(({ dealtCards, missingCards }: any) => {
                        console.log('[ALBUM/DEAL CARDS] – Cards dealed');

                        const dealtText =
                            dealtCards.size > 0 ?
                                `${senderFirstName}, I dealt *${
                                    dealtCards.size
                                }* cards from your *${collectionName}* album 😀\n- ${[
                                    ...dealtCards,
                                ].join('\n- ')}` :
                                `${senderFirstName}, I could not deal any cards 😢`;
                        const missingText =
                            missingCards.size > 0 ?
                                `There were *${
                                    missingCards.size
                                }* cards in this batch that you don't own or you don't have enough do deal with 😕\n- ${[
                                    ...missingCards,
                                ].join('\n- ')}` :
                                'You dealt a perfect batch! 🥳';
                        ctx.replyWithMarkdown(
                            [dealtText, missingText].join('\n\n')
                        );
                    })
                    .catch((error: any) => {
                        console.log('[ALBUM/DEAL CARDS] – Error dealing cards');
                        console.error(error);
                        ctx.reply('There was an error, try again later.');
                    });
            }
        })
        .catch((error) => {
            console.log('[ALBUM/DEAL CARDS] – Error retrieving album');
            console.error(error);
            ctx.reply('There was an error, try again later.');
        });
};

export const tengui = (ctx: any) => {
    console.log('[COMMANDS] – tengui');
    const [, collectionName] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Collection.get(collectionName)
        .then((collection: any) => {
            Album.get(collectionName, sender)
                .then(async ({ found, album }: any) => {
                    if (!found) {
                        ctx.replyWithMarkdown(
                            `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
                        );
                    } else {
                        const result = await album.tengui();
                        const tengui = [];
                        // eslint-disable-next-line guard-for-in
                        for (const card in result) {
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
                .catch((error) => {
                    console.log('[ALBUM/TENGUI – Error retrieving album');
                    console.error(error);
                    ctx.reply('There was an error, try again later.');
                });
        })
        .catch((error) => {
            console.log('[ALBUM/TENGUI – Error retrieving collection');
            console.error(error);
            ctx.reply('There was an error, try again later.');
        });
};

export const falti = (ctx: any) => {
    console.log('[COMMANDS] – falti');
    const [, collectionName] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Collection.get(collectionName)
        .then((collection: any) => {
            Album.get(collectionName, sender)
                .then(async ({ found, album }: any) => {
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
                .catch((error) => {
                    console.log('[ALBUM/FALTI – Error retrieving album');
                    console.error(error);
                    ctx.reply('There was an error, try again later.');
                });
        })
        .catch((error) => {
            console.log('[ALBUM/FALTI – Error retrieving collection');
            console.error(error);
            ctx.reply('There was an error, try again later.');
        });
};

export const repes = (ctx: any) => {
    console.log('[COMMANDS] – repes');
    const [, collectionName] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Album.get(collectionName, sender)
        .then(async ({ found, album }: any) => {
            if (!found) {
                ctx.replyWithMarkdown(
                    `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
                );
            } else {
                const result = await album.repes();
                const repes = [];
                // eslint-disable-next-line guard-for-in
                for (const card in result) {
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
        .catch((error) => {
            console.log('[ALBUM/REPES] – Error retrieving album');
            console.error(error);
            ctx.reply('There was an error, try again later.');
        });
};

export const count = (ctx: any) => {
    console.log('[COMMANDS] – count');
    const [, collectionName] = ctx.message.text.split(' ');
    const sender = ctx.from.username;
    const senderFirstName = ctx.from.first_name;

    if (!collectionName || !sender) {
        ctx.reply(CHECK_HELP_COPY);
        return;
    }

    Collection.get(collectionName)
        .then((collection: any) => {
            Album.get(collectionName, sender)
                .then(async ({ found, album }: any) => {
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
                .catch((error) => {
                    console.log('[ALBUM/COUNT] – Error retrieving album');
                    console.error(error);
                    ctx.reply('There was an error, try again later.');
                });
        })
        .catch((error) => {
            console.log('[ALBUM/COUNT] – Error retrieving collection');
            console.error(error);
            ctx.reply('There was an error, try again later.');
        });
};

// Deprecated
// export const update = (ctx: any) => {
//     console.log('[COMMANDS] – update');
//     const [, collectionName] = ctx.message.text.split(' ');
//     const sender = ctx.from.username;
//     const senderFirstName = ctx.from.first_name;

//     if (!collectionName || !sender) {
//         ctx.reply(CHECK_HELP_COPY);
//         return;
//     }

//     Collection.get(collectionName)
//         .then((collection: any) => {
//             Album.getLegacy(collectionName, sender)
//                 .then(async ({ found, album }: any) => {
//                     if (!found) {
//                         ctx.replyWithMarkdown(
//                             `${senderFirstName}, I did not find your *${collectionName}* album. If you want me to create one for you, use _/newAlbum ${collectionName}_.`
//                         );
//                     } else {
//                         const result = await album.update();
//                         if (result) {
//                             ctx.replyWithMarkdown(
//                                 `${senderFirstName}, the Collection *${collectionName}* has been updated.`
//                             );
//                         } else {
//                             ctx.replyWithMarkdown(
//                                 'There was an error updating your Collection'
//                             );
//                         }
//                     }
//                 })
//                 .catch(() => {
//                     ctx.reply('There was an error, try again later.');
//                 });
//         })
//         .catch(() => {
//             ctx.reply('There was an error, try again later.');
//         });
// };
