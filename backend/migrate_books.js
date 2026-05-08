const { pool } = require('./src/config/database');

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    console.log('Adding columns to books table...');
    
    await connection.execute(`
      ALTER TABLE books 
      ADD COLUMN IF NOT EXISTS accepted_payment_methods VARCHAR(255) DEFAULT 'cod',
      ADD COLUMN IF NOT EXISTS jazzcash_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS easypaisa_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS bank_details TEXT;
    `);

    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
