const { Telegraf, Markup, session } = require('telegraf');
const { configDotEnv } = require('../util/env');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session({ defaultSession: () => ({ state: undefined }) }));

const menu = Markup.keyboard([
    ['View RSS list', 'Add new RSS'],
    ['Help', 'Feedback'],
]).oneTime().resize();

module.exports = { bot, menu, Markup };
