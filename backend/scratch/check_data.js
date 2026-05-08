
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- BOOKSTORES DATA ---');
        const [rows] = await connection.execute('SELECT * FROM bookstores');
        console.table(rows);
        
        console.log('\n--- RECENT USERS ---');
        const [users] = await connection.execute('SELECT id, full_name, email, role, is_active FROM users ORDER BY id DESC LIMIT 5');
        console.table(users);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkData();
