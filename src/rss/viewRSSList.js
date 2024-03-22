const { getListRSS } = require('../rss/rssData');

module.exports = async function viewRSSList(ctx) {
  const userId = ctx.from.id;
  try {
    const rssData = await getListRSS(userId);
    if (rssData.length === 0) {
      await ctx.reply('No RSS links found for your account.');
    } else {
      const formattedRssList = rssData.map((rss) => `ID: ${rss.id} | ${rss.title} | ${rss.link}`).join('\n');
      await ctx.reply('Your RSS links:\n' + formattedRssList);
    }
  } catch (error) {
    await ctx.reply('Error fetching RSS links. Please try again.');
  }
  ctx.session.state = undefined;
}
