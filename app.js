const { bot } = require('./src/bot/telegrafBot');
const { parseRSS } = require('./src/rss/rssParsing');
const { handleMessage } = require('./src/message/messageHandling');
const { errorHandler } = require('./src/error/errorHandler');
const startBot = require('./src/bot/startBot');
const showUser = require('./src/user/showUser');
const help = require('./src/message/help');
const addNewRSS = require('./src/rss/addNewRSS');
const viewRSSList = require('./src/rss/viewRSSList');

process.on('uncaughtException', errorHandler);
process.on('unhandledRejection', errorHandler);

bot.start(startBot);

bot.hears('Help', help);
bot.hears('Add new RSS', addNewRSS);
bot.hears('View RSS list', viewRSSList);
bot.hears('User Data', showUser);

bot.on('message', async (ctx) => {
  await handleMessage(ctx);
});

parseRSS(bot);
setInterval(() => parseRSS(bot), 15000);

bot.launch();