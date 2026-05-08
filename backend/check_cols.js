const { pool } = require('./src/config/database');

pool.query("ALTER TABLE transactions ADD COLUMN transaction_reference VARCHAR(255);")
  .then(res => console.log('Added transaction_reference column'))
  .catch(console.error)
  .finally(() => process.exit(0));
