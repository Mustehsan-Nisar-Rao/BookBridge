
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- BOOKSTORES TABLE ---');
        const [columns] = await connection.execute('DESCRIBE bookstores');
        columns.forEach(col => console.log(col.Field, col.Type, col.Null, col.Default));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkSchema();
