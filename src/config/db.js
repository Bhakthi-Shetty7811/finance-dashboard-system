const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error('DB Query Error:', err.message);
    throw err;
  }
};

const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected');
    return true;
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    return false;
  }
};

module.exports = { query, pool, testConnection };