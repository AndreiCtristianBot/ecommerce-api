// config/db.js
require('dotenv').config(); // Încarcă variabilele de mediu aici

const { Pool } = require('pg');

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.PGDATABASE || 'ecommerce_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false // Permite conexiuni SSL fără verificarea autorității (folosit pentru Render)
  }
};

console.log('Pool config:', poolConfig);

const pool = new Pool(poolConfig);

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL');
    return pool;
  } catch (error) {
    console.error('Database connection error', error);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };





