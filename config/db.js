// config/db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.PGDATABASE || 'ecommerce_db',  // folosește variabila de mediu PGDATABASE sau valoarea implicită 'ecommerce_db'
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000,
});

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Connected to PostgreSQL');
    } catch (error) {
        console.error('Database connection error', error);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };



