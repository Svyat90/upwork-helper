const { configDotEnv } = require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const xml2js = require('xml2js');

const bot = new Telegraf(process.env.BOT_TOKEN);

const rssFeedUrl = 'https://www.upwork.com/ab/feed/jobs/rss?api_params=1&job_type=fixed&orgUid=732306551933890561&paging=0%3B10&proposals=0-4%2C5-9%2C10-14&q=%28php%20OR%20laravel%20OR%20API%20OR%20developer%20OR%20engineer%20OR%20Back-End%20OR%20Backend%20OR%20Back%29&securityToken=258baeaa9538ed0424704f375d424cd853c0f72d7b4d8f7aa1f1ee75ad35ea4625025a59e2c7a732dfd50260c276966aa405b7fcce2e7d35038cf5bf128ebcbe&sort=recency&subcategory2_uid=531770282584862733&userUid=732306551929696256&verified_payment_only=1';

const menu = Markup.keyboard([
  ['Add new RSS', 'View RSS list'],
  ['/parse', 'Parse RSS'],
]).oneTime().resize();

bot.start((ctx) => {
  ctx.reply('Welcome! Select an option from the menu:', menu);
});

bot.hears('Add new RSS', (ctx) => ctx.reply('Enter your RSS link'));
bot.hears('View RSS list', (ctx) => ctx.reply('Show PSS List 👍'));

bot.hears('/parse', (ctx) => {
  axios.get(rssFeedUrl)
  .then(response => {
    const xmlData = response.data;

    xml2js.parseString(xmlData, { explicitArray: false, mergeAttrs: true }, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
      } else {
        console.log(result);

        for (const item of result.rss.channel.item) {
          const message = createMessage(item);

          ctx.replyWithMarkdownV2(message, {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Job post', url: item.link }]
              ]
            }
          });
        }
      }
    });
  })
  .catch(error => {
    console.error('Error fetching RSS feed:', error);
  });
})

function createMessage(item) {
  return escapeSpecialCharacters(`
📢 Title: ${item.title}
💬 Description: ${item.description}`);
}

function escapeSpecialCharacters(inputString) {
  const htmlTagsRegex = /<[^>]*>/g;
  const stringWithoutTags = inputString.replace(htmlTagsRegex, '');

  // const specialCharacters = /-[\]{}()*+?.,\\^$|#]/g;
  const specialCharacters = /[-+)(}{\]\[.><=#!]/g;
  
  return stringWithoutTags.replace(specialCharacters, '\\$&');
}

bot.on('text', (ctx) => {
  ctx.reply('Invalid option. Please use the menu.');
});

bot.launch();