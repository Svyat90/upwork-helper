module.exports = async function addNewRSS(ctx) {
    ctx.session.state = 'waitingForLink';
    await ctx.reply('Please enter the RSS link:');
}  