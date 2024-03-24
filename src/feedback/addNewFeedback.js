module.exports = async function addNewFeedback(ctx) {
    ctx.session.state = 'waitingForFeedback';
    await ctx.reply('Please enter your feedback:');
}  