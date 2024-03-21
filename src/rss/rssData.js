const { pool } = require('../database/database');

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

module.exports = { saveUserRSS, getRssData, getAllRss };
