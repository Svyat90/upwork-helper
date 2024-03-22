const { Telegraf, Markup, session } = require('telegraf');
const { configDotEnv } = require('../util/env');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session({
    defaultSession: () => ({
        state: undefined,
        rssTitle: undefined
    })
}));

const menu = Markup.keyboard([
    ['View RSS list', 'Add new RSS'],
    ['Delete RSS', 'Help'],
]).oneTime().resize();

module.exports = { bot, menu, Markup };
