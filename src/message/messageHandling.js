const { menu, Markup } = require('../bot/telegrafBot');
const { saveUserRSS } = require('../rss/rssData');
const { isValidUrl } = require('../util/utils');

async function handleMessage(ctx) {
  if (ctx.session.state === 'waitingForLink') {    
    try {
      const userId = ctx.from.id;
      const rssLink = ctx.message.text.trim();

      if (isValidUrl(rssLink)) {
        await saveUserRSS(userId, rssLink, ctx.message)
        await ctx.reply('RSS link added successfully!');
      } else {
        await ctx.reply('Invalid RSS link format. Please enter a valid URL.');
      }

    } catch (error) {
      console.error('Error inserting RSS link into the database:', error);
      await ctx.reply('Error adding RSS link. Please try again.');
    }

    ctx.session.state = undefined;

  } else {
    await ctx.reply('Invalid option. Please use the menu: ', menu);
  }
}

module.exports = { handleMessage };
