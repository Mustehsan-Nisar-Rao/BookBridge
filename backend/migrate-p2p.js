const { pool } = require('./src/config/database');

async function runMigration() {
  try {
    const connection = await pool.getConnection();

    console.log("Migrating users table...");
    try {
      await connection.query('ALTER TABLE users ADD COLUMN jazzcash_number VARCHAR(50) DEFAULT NULL;');
      await connection.query('ALTER TABLE users ADD COLUMN easypaisa_number VARCHAR(50) DEFAULT NULL;');
      await connection.query('ALTER TABLE users ADD COLUMN bank_details TEXT DEFAULT NULL;');
      console.log("users table updated successfully.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("users columns already exist, skipping.");
      } else {
        throw e;
      }
    }

    console.log("Migrating transactions table...");
    try {
      await connection.query('ALTER TABLE transactions ADD COLUMN transaction_reference VARCHAR(100) DEFAULT NULL;');
      console.log("transactions table updated successfully.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("transactions column already exists, skipping.");
      } else {
        throw e;
      }
    }

    connection.release();
    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
