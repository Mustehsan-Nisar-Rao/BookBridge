
const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function testRegister() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const email = 'test_bookstore_' + Date.now() + '@university.com';
        const password = 'Password123!';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        console.log('Testing registration for:', email);

        await connection.beginTransaction();

        const [userResult] = await connection.execute(
            `INSERT INTO users 
             (full_name, email, password, role, university, is_active)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ['Test Bookstore', email, hashedPassword, 'bookstore', 'Test Uni', 0]
        );

        const userId = userResult.insertId;
        console.log('User created with ID:', userId);

        try {
            await connection.execute(
                `INSERT INTO bookstores 
                 (user_id, store_name, store_description, registration_number, subscription_amount, payment_method, payment_reference, payment_notes, payment_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [userId, 'Test Store', 'Desc', 'REG' + Date.now(), 4000.00, 'jazzcash', 'REF123', 'Notes']
            );
            console.log('Bookstore entry created successfully!');
            await connection.commit();
        } catch (err) {
            console.error('ERROR in bookstore insert:', err.message);
            await connection.rollback();
        }

    } catch (err) {
        console.error('TOP LEVEL ERROR:', err.message);
    } finally {
        await connection.end();
    }
}

testRegister();
