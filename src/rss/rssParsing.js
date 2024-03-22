const { xml2js } = require('../xml/xmlParsing');
const { pool } = require('../database/database');
const { getAllRss } = require('./rssData');
const { createMessage } = require('../message/messageUtils');
const moment = require('moment');
const axios = require('axios');

async function parseAllRSS(bot) {
  try {
    const rssData = await getAllRss();

    rssData.forEach(async (rss) => {
      const offers = await parseRSS(rss.link);
      if (! offers) {
        console.error(`Error parsing RSS feed: ${rss.link}`, error);
        return;
      }

      for (const offer of offers) {
        const isOfferUnique = await isUniqueOffer(offer, rss.user_id, rss.chat_id);

        if (isOfferUnique) {
          console.log(`--- rss#${rss.id} new offer at ${moment().format('Y-MM-DD HH:mm:ss')} - ${offer.title}`);
          const message = createMessage(offer);
          const truncatedMessage = message.substring(0, 320) + ' \\.\\.\\.';
          await saveOfferToDatabase(offer, truncatedMessage, rss.user_id, rss.chat_id);

          bot.telegram.sendMessage(rss.chat_id, truncatedMessage, {
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Job post', url: offer.link }],
              ],
            },
          });
        }
      }
    });

  } catch (error) {
    console.error('Error sending RSS feed:', error);
  }
}

async function parseRSS(rssLink) {
  try {
      const response = await axios.get(rssLink);
      const xmlData = response.data;
      const result = await xml2js.parseStringPromise(xmlData, { explicitArray: false, mergeAttrs: true });
      
      return result.rss.channel.item;

  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
    return null;
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

module.exports = { parseAllRSS, parseRSS, isUniqueOffer, saveOfferToDatabase };
