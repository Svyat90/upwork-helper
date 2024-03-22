const { pool } = require('../database/database');

async function saveRSS(userId, rssLink, rssTitle, payload) {
  try {
    await pool.execute('INSERT INTO rss (user_id, link, title, payload) VALUES (?, ?, ?, ?)', [
      userId,
      rssLink,
      rssTitle,
      JSON.stringify(payload)
    ]);

  } catch (error) {
    console.error(`Error saving RSS user#${userId} rss#${rssId}: `, error);
  }
}

async function existsRSS(userId, rssId) {
  try {
    const [rows] = await pool.execute(`
      SELECT rss.id FROM rss
      INNER JOIN users ON users.user_id = rss.user_id
      WHERE users.user_id = ? AND rss.id = ?
    `, [userId, rssId]);

    return rows.length > 0;

  } catch (error) {
    console.error(`Error checking RSS on exists user#${userId} rss#${rssId}: `, error);
    return false;
  }
}

async function deleteRSS(userId, rssId) {
  try {
    await pool.execute('DELETE FROM rss where user_id = ? and id = ?', [userId, rssId]);

  } catch (error) {
    console.error(`Error deleting RSS user#${userId} rss#${rssId}: `, error);
  }
}

async function getListRSS(userId) {
  try {
    const [rows] = await pool.execute(`
        SELECT rss.id, rss.title, rss.link FROM rss
        INNER JOIN users ON users.user_id = rss.user_id
        WHERE users.user_id = ?
    `, [userId]);

    return rows;

  } catch (error) {
    console.error(`Error getting RSS user#${userId}: `, error);
    return null;
  }
}

async function getAllRss() {
  try {
    const [rows] = await pool.execute(`
        SELECT rss.id, users.user_id, users.chat_id, rss.link FROM rss
        INNER JOIN users ON users.user_id = rss.user_id
    `);

    return rows;

  } catch (error) {
    console.error('Error getting all RSS:', error);
    return null;
  }
}

module.exports = { saveRSS, existsRSS, deleteRSS, getListRSS, getAllRss };
