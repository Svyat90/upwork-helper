const { bot } = require('./src/bot/telegrafBot');
const { parseAllRSS } = require('./src/rss/rssParsing');
const { messageHandler } = require('./src/message/messageHandler');
const { errorHandler } = require('./src/error/errorHandler');
const startBot = require('./src/bot/startBot');
const showUser = require('./src/user/showUser');
const help = require('./src/message/help');
const addNewRSS = require('./src/rss/addNewRSS');
const viewRSSList = require('./src/rss/viewRSSList');
const removeRSS = require('./src/rss/removeRSS');
const addNewFeedback = require('./src/feedback/addNewFeedback');

process.on('uncaughtException', errorHandler);
process.on('unhandledRejection', errorHandler);

bot.start(startBot);

bot.hears(['/help', 'Help'], help);
bot.hears(['/list', 'View RSS list'], viewRSSList);
bot.hears(['/add', 'Add new RSS'], addNewRSS);
bot.hears(['/delete', 'Delete RSS'], removeRSS);
bot.hears(['/feedback', 'Feedback'], addNewFeedback);

bot.on('message', async (ctx) => {
  await messageHandler(ctx);
});

parseAllRSS(bot);
setInterval(() => parseAllRSS(bot), 15000);

bot.launch();