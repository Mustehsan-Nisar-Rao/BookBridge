const { pool } = require('./src/config/database');

async function runMigration() {
  try {
    const connection = await pool.getConnection();

    console.log('Migrating bookstores table...');
    try {
      await connection.query('ALTER TABLE bookstores ADD COLUMN subscription_amount DECIMAL(10,2) DEFAULT 4000.00;');
      await connection.query("ALTER TABLE bookstores ADD COLUMN payment_method ENUM('jazzcash','easypaisa','bank') DEFAULT NULL;");
      await connection.query('ALTER TABLE bookstores ADD COLUMN payment_reference VARCHAR(255) DEFAULT NULL;');
      await connection.query('ALTER TABLE bookstores ADD COLUMN payment_notes TEXT DEFAULT NULL;');
      await connection.query("ALTER TABLE bookstores ADD COLUMN payment_status ENUM('pending','verified','rejected') DEFAULT 'pending';");
      console.log('bookstores table updated successfully.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('bookstores columns already exist, skipping.');
      } else {
        throw e;
      }
    }

    connection.release();
    console.log('Bookstore subscription migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
