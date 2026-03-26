import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import express from 'express';
import 'dotenv/config';

import { Telegraf } from 'telegraf';

import { initNestor } from './initNestor';

const app = express();

if (!process.env.BOT_TOKEN) {
    logger.info('BOT_TOKEN is not defined.', {
        structuredData: true,
    });
} else {
    const bot = new Telegraf(process.env.BOT_TOKEN, {
        telegram: { webhookReply: true },
    });

    bot.hears('hi', (ctx) => {
        const message = `Hey there, it is ${new Date().toLocaleString()} now.`;
        ctx.reply(message);
        logger.info(message, { structuredData: true });
        logger.info(
            `${ctx.message.from.username}: ${ctx.from.id}: ${ctx.message.chat.id}`,
            { structuredData: true }
        );
    });

    initNestor(bot);

    app.use(
        bot.webhookCallback('/telegram', { secretToken: process.env.API_TOKEN })
    );
}

export const nestorBot = onRequest({
    region: process.env.REGION as string,
    minInstances: Number.parseInt(process.env.MIN_INSTANCES as string),
}, app);
