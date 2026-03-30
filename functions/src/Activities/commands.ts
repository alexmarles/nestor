import { Activity } from './Activity';

export const activities = async (ctx: any) => {
    console.log('[COMMANDS] – activities');

    try {
        const all = await Activity.getAll();

        if (all.length === 0) {
            ctx.reply('There are no activities right now.');
            return;
        }

        const formatted = all.map((a) => a.format()).join('\n');
        ctx.replyWithMarkdown(formatted);
    } catch (error) {
        console.error(error);
        ctx.reply('There was an error, try again later.');
    }
};

export const listBooks = async (ctx: any) => {
    console.log('[COMMANDS] – listBooks');

    try {
        const books = await Activity.getByType('book');

        if (books.length === 0) {
            ctx.reply('No books right now.');
            return;
        }

        const formatted = books.map((a) => a.format()).join('\n');
        ctx.replyWithMarkdown(formatted);
    } catch (error) {
        console.error(error);
        ctx.reply('There was an error, try again later.');
    }
};

export const listGames = async (ctx: any) => {
    console.log('[COMMANDS] – listGames');

    try {
        const games = await Activity.getByType('videogame');

        if (games.length === 0) {
            ctx.reply('No games right now.');
            return;
        }

        const formatted = games.map((a) => a.format()).join('\n');
        ctx.replyWithMarkdown(formatted);
    } catch (error) {
        console.error(error);
        ctx.reply('There was an error, try again later.');
    }
};

export const nowReading = async (ctx: any) => {
    console.log('[COMMANDS] – nowReading');
    const text = ctx.message.text.replace(/^\/nowReading\s*/, '');

    if (!text) {
        ctx.reply('Usage: /nowReading <title> by <author>');
        return;
    }

    const parts = text.split(' by ');
    const title = parts[0].replace(/,\s*$/, '').trim();
    const author =
        parts.length > 1 ? parts.slice(1).join(' by ').trim() : undefined;

    try {
        if (await Activity.exists(title)) {
            ctx.reply(`"${title}" is already logged.`);
            return;
        }

        const activity = await Activity.add({
            type: 'book',
            title,
            author,
        });
        ctx.replyWithMarkdown(`Got it!\n\n${activity.format()}`);
    } catch (error) {
        console.error(error);
        ctx.reply('There was an error, try again later.');
    }
};

export const nowPlaying = async (ctx: any) => {
    console.log('[COMMANDS] – nowPlaying');
    const text = ctx.message.text.replace(/^\/nowPlaying\s*/, '');

    if (!text) {
        ctx.reply('Usage: /nowPlaying <title> on <platform>');
        return;
    }

    const parts = text.split(' on ');
    const title = parts[0].replace(/,\s*$/, '').trim();
    const platform =
        parts.length > 1 ? parts.slice(1).join(' on ').trim() : undefined;

    try {
        if (await Activity.exists(title)) {
            ctx.reply(`"${title}" is already logged.`);
            return;
        }

        const activity = await Activity.add({
            type: 'videogame',
            title,
            platform,
        });
        ctx.replyWithMarkdown(`Got it!\n\n${activity.format()}`);
    } catch (error) {
        console.error(error);
        ctx.reply('There was an error, try again later.');
    }
};

export const removeActivity = async (ctx: any) => {
    console.log('[COMMANDS] – removeActivity');
    const title = ctx.message.text.replace(/^\/removeActivity\s*/, '').trim();

    if (!title) {
        ctx.reply('Usage: /removeActivity <title>');
        return;
    }

    try {
        const removed = await Activity.remove(title);

        if (!removed) {
            ctx.reply(`No activity found with title "${title}".`);
            return;
        }

        ctx.reply(`Removed "${title}".`);
    } catch (error) {
        console.error(error);
        ctx.reply('There was an error, try again later.');
    }
};
