const fs = require('fs');

async function handleFeedback(ctx) {
  const userId = ctx.from.id;
  const msg = ctx.message.text.trim();
  fs.appendFileSync('feedback.log', `${new Date().toString()} - New feedback from user#${userId} - ${msg}\n`);
}

module.exports = { handleFeedback };
