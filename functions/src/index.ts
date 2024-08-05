import * as functions from 'firebase-functions';
import express from 'express';
import 'dotenv/config';

import { Telegraf } from 'telegraf';

import { initNestor } from './initNestor';

const app = express();
// let telegramStatus = 'Bot is not loaded';

if (!process.env.BOT_TOKEN) {
    functions.logger.info('BOT_TOKEN is not defined.', {
        structuredData: true,
    });
    // telegramStatus = 'BOT_TOKEN is not defined.';
} else {
    const bot = new Telegraf(process.env.BOT_TOKEN, {
        telegram: { webhookReply: true },
    });

    bot.hears('hi', (ctx) => {
        const message = `Hey there, it is ${new Date().toLocaleString()} now.`;
        ctx.reply(message);
        functions.logger.info(message, { structuredData: true });
        functions.logger.info(
            `${ctx.message.from.username}: ${ctx.from.id}: ${ctx.message.chat.id}`,
            { structuredData: true }
        );
    });

    initNestor(bot);

    app.use(
        bot.webhookCallback('/telegram', { secretToken: process.env.API_TOKEN })
    );
    // telegramStatus = 'Bot is loaded.';
}

exports.nestorBot = functions
    .region(process.env.REGION as string)
    .runWith({
        minInstances: Number.parseInt(process.env.MIN_INSTANCES as string),
    })
    .https.onRequest(app);
