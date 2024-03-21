const mysql = require('mysql2/promise');
const { configDotEnv } = require('../util/env');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool(dbConfig);

(async () => {
    try {
      const connection = await pool.getConnection();
      console.log('Connected to the database!');
      connection.release();
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
})();