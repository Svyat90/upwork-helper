const { saveUserData } = require('../user/userData');
const { menu } = require('../bot/telegrafBot');

async function startBot(ctx) {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const username = ctx.from.username;
  console.log('chat#' + chatId + ' started. user#' + userId);
  await saveUserData(userId, chatId, username, ctx);
  await ctx.reply('Welcome! Select an option from the menu:', menu);
}

module.exports = startBot;