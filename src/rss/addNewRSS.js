module.exports = async function addNewRSS(ctx) {
    ctx.session.state = 'waitingForRssTag';
    await ctx.reply('Please enter RSS title:');
}  