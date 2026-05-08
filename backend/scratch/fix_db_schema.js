
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Updating bookstores table schema...');
        
        // Add missing columns
        await connection.execute(`
            ALTER TABLE bookstores 
            ADD COLUMN subscription_amount DECIMAL(10,2) DEFAULT 4000.00 AFTER registration_number,
            ADD COLUMN payment_method ENUM('jazzcash', 'easypaisa', 'bank') DEFAULT NULL AFTER subscription_amount,
            ADD COLUMN payment_reference VARCHAR(255) DEFAULT NULL AFTER payment_method,
            ADD COLUMN payment_notes TEXT AFTER payment_reference,
            ADD COLUMN payment_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending' AFTER payment_notes
        `);

        console.log('Schema updated successfully!');
    } catch (err) {
        console.error('Error during schema update:', err.message);
    } finally {
        await connection.end();
    }
}

updateSchema();
