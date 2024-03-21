const { pool } = require('../database/database');

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

module.exports = { saveUserData, getUserData };
