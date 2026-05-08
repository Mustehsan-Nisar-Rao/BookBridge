const { pool } = require('./src/config/database');

async function runMigration() {
  try {
    const connection = await pool.getConnection();

    console.log("Migrating books table...");
    try {
      await connection.query('ALTER TABLE books ADD COLUMN accepted_payment_methods VARCHAR(255) DEFAULT \'cod\';');
      console.log("books table updated successfully.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("books column already exists, skipping.");
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
