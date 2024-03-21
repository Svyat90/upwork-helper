const { configDotEnv } = require('dotenv').config();
const { Telegraf, Markup, session } = require('telegraf');
const { message } = require("telegraf/filters");
const axios = require('axios');
const xml2js = require('xml2js');
const moment = require('moment');
const mysql = require('mysql2/promise');
const he = require('he');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool(dbConfig);
const bot = new Telegraf(process.env.BOT_TOKEN);

// Initialize session middleware
bot.use(session({ defaultSession: () => ({ state: undefined }) }));

const menu = Markup.keyboard([
  ['View RSS list', 'Add new RSS'],
  ['Help', 'Feedback',],
]).oneTime().resize();

// Middleware to run while every message
// bot.use(async (ctx, next) => {
//   return next();
// });

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const username = ctx.from.username;
  
  console.log('chat#' + chatId + ' started. user#' + userId);

  await saveUserData(userId, chatId, username, ctx);
  await ctx.reply('Welcome! Select an option from the menu:', menu);
});

bot.hears('Help', async (ctx) => {
  await ctx.reply(`
Hi there!
I'm a tool built to assist you in tracking new job postings on Upwork. Simply provide me with the web addresses (URLs) of your Upwork job feeds, and I'll notify you as soon as new jobs are posted. Enhance your job search efficiency and increase your chances of getting hired 💸.
  
Feeds:
/add - Adds your feed to the monitoring list.
/list - View and manage saved feeds.
  
Other:
/help - View this message.
/feedback - Send feedback.
/start - Start the bot.

For assistance:
@dev2078 - Reach out for help or any queries.

If you have feedback, please use the /feedback command to let me know how I can improve!
`);
});

bot.hears('Add new RSS', async (ctx) => {
  ctx.session.state = 'waitingForLink';
  await ctx.reply('Please enter the RSS link:')
});

bot.hears('View RSS list', async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    const rssData = await getRssData(userId);

    if (rssData.length === 0) {
      await ctx.reply('No RSS links found for your account.');
    } else {
      const formattedRssList = rssData.map((rss) => `#${rss.id} - ${rss.link}`).join('\n');
      await ctx.reply('Your RSS links:\n' + formattedRssList);
    }

  } catch (error) {
    await ctx.reply('Error fetching RSS links. Please try again.');
  }
});

bot.hears('/parse', () => parseRSS());

bot.hears('User Data', async (ctx) => {
  const userId = ctx.from.id;
  const userData = await getUserData(userId);

  if (userData) {
    await ctx.reply(`User ID: ${userData.user_id}, Username: ${userData.username}`);
  } else {
    await ctx.reply('User not found.');
  }
});

parseRSS();
// Run Parse RSS list command every 15 seconds
setInterval(() => parseRSS(), 15000);

async function parseRSS() {
  try {
    const rssData = await getAllRss();
    
    rssData.forEach(async (rss) => {
      const response = await axios.get(rss.link);
      const xmlData = response.data;

      const result = await xml2js.parseStringPromise(xmlData, { explicitArray: false, mergeAttrs: true });

      for (const item of result.rss.channel.item) {
        const isOfferUnique = await isUniqueOffer(item, rss.user_id, rss.chat_id);

        if (isOfferUnique) {
          console.log(`--- rss#${rss.id} new offer at ${moment().format('Y-MM-DD HH:mm:ss')} - ${item.title}`);
          const message = createMessage(item);
          // max long of message
          // const truncatedMessage = message.substring(0, 4096);
          const truncatedMessage = message.substring(0, 320) + ' \\.\\.\\.';
          await saveOfferToDatabase(item, truncatedMessage, rss.user_id, rss.chat_id);

          bot.telegram.sendMessage(rss.chat_id, truncatedMessage, {
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Job post', url: item.link }],
              ],
            },
          });
        }
      }
    });

  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
  }
}

async function isUniqueOffer(item, userId, chatId) {
  // Todo split between two tables | save only unique offers | checked by date
  const [rows] = await pool.query(`SELECT id FROM offers WHERE title = ? AND user_id = ? AND chat_id = ?`, [
    item.title,
    userId,
    chatId
  ]);

  return rows.length === 0;
}

async function saveUserData(userId, chatId, username, payload) {
  try {
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO users (user_id, chat_id, username, payload) VALUES (?, ?, ?, ?)', [
      userId,
      chatId,
      username,
      JSON.stringify(payload)
    ]);
    connection.release();
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

async function saveUserRSS(userId, rssLink, payload) {
  try {
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO rss (user_id, link, payload) VALUES (?, ?, ?)', [
      userId,
      rssLink,
      JSON.stringify(payload)
    ]);
    connection.release();
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

async function getUserData(userId) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
    connection.release();

    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

async function getRssData(userId) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      select rss.id, rss.link from rss
      inner join users on users.user_id = rss.user_id
      where users.user_id = ?
    `, [userId]);

    connection.release();
    return rows;

  } catch (error) {
    console.error('Error getting rss data:', error);
    return null;
  }
}

async function getAllRss() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      select rss.id, users.user_id, users.chat_id, rss.link from rss
      inner join users on users.user_id = rss.user_id
    `);
    connection.release();
    return rows;

  } catch (error) {
    console.error('Error getting all rss data:', error);
    return null;
  }
}

async function saveOfferToDatabase(offerData, truncatedMessage, userId, chatId) {
  await pool.query('INSERT INTO offers (user_id, chat_id, title, description, link, payload, truncatedMessage) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    userId,
    chatId,
    offerData.title,
    offerData.description,
    offerData.link,
    JSON.stringify(offerData),
    truncatedMessage
  ]);
}

function createMessage(item) {
  // Decode HTML entities
  let decodedDescription = he.decode(item.description);
  decodedDescription = decodedDescription.replace(/&amp;quot;/g, '"');
  
  const trimmedTitle = he.decode(item.title).replace(' - Upwork', '').trim();
  const { country, budget, clearedDescription, hourlyRate } = parseAndClearData(decodedDescription);
  const createdAt = formatDateRelative(item.pubDate);

  let msg = '';
  msg += (budget !== null ? '💼 Title: ' : '⏱️ Title: ') + trimmedTitle + '\n';
  msg += (budget !== null ? '💰 Budget: ' + budget + '\n' : '');
  msg += (hourlyRate !== null ? '💲 Rate: ' + hourlyRate + '\n' : '');
  msg += (country !== null ? '🗺️ Country: ' + he.decode(country) + '\n' : '');
  msg += '🕒 Created: ' + createdAt + '\n';
  msg += 'ℹ️ Description: ' + clearedDescription;

  return escapeSpecialCharacters(msg);
}

function parseAndClearData(description) {
  // Regular expression to match the "Country" and "Budget" information
  const countryRegex = /<b>Country<\/b>:\s*([^<]+)/;
  const budgetRegex = /<b>Budget<\/b>:\s*(\$[0-9,]+)/;
  const hourlyRateRegex = /<b>Hourly Range<\/b>: ([^<]+)<br \/>/;

  // Extracting matches from the description using regular expressions
  const countryMatch = description.match(countryRegex);
  const budgetMatch = description.match(budgetRegex);
  const hourlyRateMatch = description.match(hourlyRateRegex);

  // Extracted values
  const country = countryMatch ? countryMatch[1].trim() : null;
  const budget = budgetMatch ? budgetMatch[1].trim() : null;
  const hourlyRate = hourlyRateMatch ? hourlyRateMatch[1].trim() : null;

  // Find the position of '<b>Budget</b>'
  const positionBudget = description.indexOf('<b>Budget</b>');
  const positionRate = description.indexOf('<b>Hourly Range</b>');

  // Extract the substring before the position
  description = description.trim();
  let clearedDescription = positionBudget !== -1 ? description.substring(0, positionBudget) : description;
  clearedDescription = positionRate !== -1 ? clearedDescription.substring(0, positionRate) : clearedDescription;
  clearedDescription = clearedDescription.trim();

  return { country, budget, clearedDescription, hourlyRate };
}

function formatDateRelative(dateString) {
  const date = moment(dateString, 'ddd, DD MMM YYYY HH:mm:ss Z');
  const secondsAgo = moment().diff(date, 'seconds');

  if (secondsAgo < 60) {
    return `${secondsAgo} s. ago`;
  } else if (secondsAgo < 60 * 60) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo} m. ago`;
  } else if (secondsAgo < 24 * 60 * 60) {
    const hoursAgo = Math.floor(secondsAgo / (60 * 60));
    return `${hoursAgo} h. ago`;
  } else {
    const daysAgo = Math.floor(secondsAgo / (24 * 60 * 60));
    return `${daysAgo} d. ago`;
  }
}

function escapeSpecialCharacters(inputString) {
  const htmlTagsRegex = /<[^>]*>/g;
  const stringWithoutTags = inputString.replace(htmlTagsRegex, '');

  const specialCharacters = /[-+)(}_~*`@{}[\].><=\\$|#!]/g;
  
  return stringWithoutTags.replace(specialCharacters, '\\$&');
}

bot.on(message("text"), async (ctx) => {
  if (ctx.session.state === 'waitingForLink') {    
    try {
      const userId = ctx.from.id;
      const rssLink = ctx.message.text.trim();

      if (isValidUrl(rssLink)) {
        // Todo need check Upwork URL
        await saveUserRSS(userId, rssLink, ctx.message)
        await ctx.reply('RSS link added successfully!');
      } else {
        await ctx.reply('Invalid RSS link format. Please enter a valid URL.');
      }

    } catch (error) {
      console.error('Error inserting RSS link into the database:', error);
      await ctx.reply('Error adding RSS link. Please try again.');
    }

    ctx.session.state = undefined;

  } else {
    await ctx.reply('Invalid option. Please use the menu: ', menu);
  }
});

function isValidUrl(url) {
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
}

bot.launch();