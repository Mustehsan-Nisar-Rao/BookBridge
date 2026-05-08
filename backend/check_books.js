const { pool } = require('./src/config/database');

async function getBooks() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM books');
    console.log(rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

getBooks();
