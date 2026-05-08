
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
        console.table(columns);
        
        console.log('\n--- USERS TABLE ---');
        const [userCols] = await connection.execute('DESCRIBE users');
        console.table(userCols);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkSchema();
