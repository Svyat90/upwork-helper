const { menu, Markup } = require('../bot/telegrafBot');
const { saveRSS, existsRSS, deleteRSS } = require('../rss/rssData');
const { parseRSS } = require('../rss/rssParsing');
const { isValidUrl } = require('../util/utils');
const { handleFeedback } = require('../feedback/feedbackHandler');
const viewRSSList = require('../rss/viewRSSList');

async function messageHandler(ctx) {
  const userId = ctx.from.id;

  if (ctx.session.state === 'waitingForRssTag') {
      const rssTag = ctx.message.text.trim();

      if (rssTag.length >= 3 && rssTag.length <= 64) {
        ctx.session.state = 'waitingForLink';
        ctx.session.rssTitle = rssTag;
        await ctx.reply('Please enter RSS link:');
      } else {
        await ctx.reply('Invalid RSS title. Size should be between 3-64 symbols. Please try again.');
      }

  } else if (ctx.session.state === 'waitingForRssID') {
    const rssId = ctx.message.text.trim();

    if (await existsRSS(userId, rssId)) {
      await deleteRSS(userId, rssId);
      ctx.session.state = undefined;
      await ctx.reply(`RSS #${rssId} was successfully deleted.`);
      await viewRSSList(ctx);
    } else {
      await ctx.reply('Invalid RSS ID. Please try again.');
    }
    
  } else if (ctx.session.state === 'waitingForLink') {
    try {
      const rssLink = ctx.message.text.trim();

      if (isValidUrl(rssLink) && await parseRSS(rssLink)) {
        await saveRSS(userId, rssLink, ctx.session.rssTitle, ctx.message);
        ctx.session.state = undefined;
        ctx.session.rssTitle = undefined;
        await ctx.reply('RSS link added successfully!');
        await viewRSSList(ctx);
      } else {
        await ctx.reply('Invalid RSS link. Please enter a valid URL.');
      }

    } catch (error) {
      console.error('Error inserting RSS link into the database:', error);
      await ctx.reply('Error adding RSS link. Please try again.');
    }

  } else if (ctx.session.state === 'waitingForFeedback') {
    try {
      if (ctx.message.text.length > 0) {
          handleFeedback(ctx);
          ctx.session.state = undefined;
          await ctx.reply('Feedback was successfully added!');
      } else {
        await ctx.reply('Invalid contend of feedback. Please try again.');
      }

    } catch (error) {
      console.error('Error saving RSS feedback into database:', error);
      await ctx.reply('Error saving Feedback. Please try again.');
    }

  } else {
    await ctx.reply('Invalid option. Please use the menu: ', menu);
  }
}

module.exports = { messageHandler };