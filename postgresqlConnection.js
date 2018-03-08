const { Pool, Client } = require('pg');

require('dotenv').config();

const client = new Client({
	host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB
});

module.exports = client;