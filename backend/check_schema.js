const { pool } = require('./src/config/database');

async function checkSchema() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'books';
    `);
    console.log(rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

checkSchema();
