const { getUserData } = require('../user/userData');

module.exports = async function userData(ctx) {
  const userId = ctx.from.id;
  const userData = await getUserData(userId);
  if (userData) {
    await ctx.reply(`User ID: ${userData.user_id}, Username: ${userData.username}`);
  } else {
    await ctx.reply('User not found.');
  }
}
