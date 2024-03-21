const { xml2js } = require('../xml/xmlParsing');
const { pool } = require('../database/database');
const { getAllRss } = require('./rssData');
const { createMessage } = require('../message/messageUtils');
const moment = require('moment');
const axios = require('axios');

async function parseRSS(bot) {
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
  const [rows] = await pool.query(`SELECT id FROM offers WHERE title = ? AND user_id = ? AND chat_id = ?`, [
    item.title,
    userId,
    chatId
  ]);

  return rows.length === 0;
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

module.exports = { parseRSS, isUniqueOffer, saveOfferToDatabase };
