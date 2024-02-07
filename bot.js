const { configDotEnv } = require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const menu = Markup.keyboard([
  ['Add new RSS', 'View RSS list'],
]).oneTime().resize();

bot.start((ctx) => {
  ctx.reply('Welcome! Select an option from the menu:', menu);
});

bot.hears('Add new RSS', (ctx) => ctx.reply('Enter your RSS link'));
bot.hears('View RSS list', (ctx) => ctx.reply('Show PSS List 👍'));

bot.on('text', (ctx) => {
  ctx.reply('Invalid option. Please use the menu.');
});

bot.launch();