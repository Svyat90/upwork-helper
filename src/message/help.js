module.exports = async function help(ctx) {
    await ctx.reply(`
  Hi there!
  I'm a tool built to assist you in tracking new job postings on Upwork. Simply provide me with the web addresses (URLs) of your Upwork job feeds, and I'll notify you as soon as new jobs are posted. Enhance your job search efficiency and increase your chances of getting hired 💸.
    
  Feeds:
  /list - View saved feeds.
  /add - Adds your feed to the monitoring list.
  /delete - Delete feed from monitoring list.
    
  Other:
  /help - View this message.
  /feedback - Send feedback.
  /start - Start the bot.
  
  For assistance:
  @dev2078 - Reach out for help or any queries.
  
  If you have feedback, please use the /feedback command to let me know how I can improve!
  `);
  ctx.session.state = undefined;
}
  