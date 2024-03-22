module.exports = async function removeRSS(ctx) {
    ctx.session.state = 'waitingForRssID';
    await ctx.reply('Please enter RSS ID:');
}  