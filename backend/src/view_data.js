const { pool } = require('./config/database');

const tableName = process.argv[2];

if (!tableName) {
  console.log('Error: Please specify a table name (e.g., node src/view_data.js users)');
  process.exit(1);
}

async function viewData() {
  try {
    const connection = await pool.getConnection();
    console.log(`\n--- [ DATASET: ${tableName.toUpperCase()} ] ---`);
    
    const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 50`);
    
    if (rows.length === 0) {
      console.log('Table is empty.');
    } else {
      console.table(rows);
      console.log(`\nTotal rows shown: ${rows.length}`);
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error(`Error: Table '${tableName}' does not exist.`);
    } else {
      console.error('Error fetching data:', error.message);
    }
    process.exit(1);
  }
}

viewData();
