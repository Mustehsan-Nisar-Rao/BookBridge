const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function generateDump() {
  const connection = await pool.getConnection();
  let sqlDump = `-- BookBridge Data Export\n-- Generated on ${new Date().toISOString()}\n\n`;
  sqlDump += `CREATE DATABASE IF NOT EXISTS bookbridge;\nUSE bookbridge;\n\n`;

  try {
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    for (const table of tableNames) {
      console.log(`Exporting table: ${table}...`);
      
      // Get table structure
      const [createTable] = await connection.execute(`SHOW CREATE TABLE ${table}`);
      sqlDump += `${createTable[0]['Create Table']};\n\n`;

      // Get table data
      const [rows] = await connection.execute(`SELECT * FROM ${table}`);
      if (rows.length > 0) {
        sqlDump += `-- Data for table ${table}\n`;
        for (const row of rows) {
          const keys = Object.keys(row).join('`, `');
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return val;
          }).join(', ');
          sqlDump += `INSERT INTO \`${table}\` (\`${keys}\`) VALUES (${values});\n`;
        }
        sqlDump += `\n`;
      }
    }

    const dumpPath = path.join(__dirname, '../backup_data.sql');
    fs.writeFileSync(dumpPath, sqlDump);
    console.log(`\n✅ Success! Dataset exported to: ${dumpPath}`);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

generateDump();
