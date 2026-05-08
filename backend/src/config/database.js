// Database Configuration - NeonDB PostgreSQL
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool for NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Compatibility wrapper: pool.getConnection() style (mimics mysql2 interface)
pool.getConnection = async () => {
  const client = await pool.connect();

  // Convert MySQL ? placeholders → PostgreSQL $1, $2
  // Also handle MySQL backtick identifiers → PostgreSQL double quotes
  const convertQuery = (text) => {
    let pgText = text;
    let idx = 1;
    // Replace ? with $N
    pgText = pgText.replace(/\?/g, () => `$${idx++}`);
    // Replace backtick identifiers 
    pgText = pgText.replace(/`([^`]+)`/g, '"$1"');
    // Convert MySQL-style double-quoted strings to single-quoted (WHERE status = "available" → 'available')
    // We do a simple heuristic: double-quoted values in WHERE/VALUES
    pgText = pgText.replace(/= "([^"]+)"/g, "= '$1'");
    pgText = pgText.replace(/status = "([^"]+)"/g, "status = '$1'");
    return pgText;
  };

  const executeOnClient = async (text, params = []) => {
    const pgText = convertQuery(text);
    try {
      const result = await client.query(pgText, params);
      // Return rows as first element (like mysql2 destructuring)
      return [result.rows, result.fields];
    } catch (err) {
      throw err;
    }
  };

  return {
    execute: executeOnClient,
    query: executeOnClient,
    release: () => client.release(),
    beginTransaction: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
  };
};

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✓ NeonDB (PostgreSQL) connected successfully');
  } catch (error) {
    console.error('✗ NeonDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
