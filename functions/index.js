const functions = require('firebase-functions');
const { Telegraf } = require('telegraf');
const { initNestor } = require('./initNestor');
require('dotenv').config();

// functions.config().telegram.token
// or
// process.env.BOT_TOKEN
const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: { webhookReply: true },
});

// error handling
bot.catch((err, ctx) => {
    functions.logger.error('[Bot] Error', err);
    return ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// initialize the commands
initNestor(bot);

// handle all telegram updates with HTTPs trigger
exports.nestorBot = functions
    .region(process.env.REGION)
    .runWith({ minInstances: Number.parseInt(process.env.MIN_INSTANCES) })
    .https.onRequest(async (request, response) => {
        functions.logger.log('Incoming message', request.body);
        return await bot.handleUpdate(request.body, response).then(rv => {
            // if it's not a request from the telegram, rv will be undefined, but we should respond with 200
            return !rv && response.sendStatus(200);
        });
    });
