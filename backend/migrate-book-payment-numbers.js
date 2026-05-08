const { pool } = require('./src/config/database');

async function migrate() {
  const connection = await pool.getConnection();
  const cols = ['jazzcash_number', 'easypaisa_number', 'bank_details'];
  for (const col of cols) {
    try {
      const type = col === 'bank_details' ? 'TEXT DEFAULT NULL' : 'VARCHAR(50) DEFAULT NULL';
      await connection.query(`ALTER TABLE books ADD COLUMN ${col} ${type}`);
      console.log(`Added books.${col}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log(`books.${col} already exists, skipped.`);
      else throw e;
    }
  }
  connection.release();
  console.log('Done!');
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
