const mysql = require('mysql2/promise');
const { configDotEnv } = require('../util/env');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool(dbConfig);

module.exports = { pool };
