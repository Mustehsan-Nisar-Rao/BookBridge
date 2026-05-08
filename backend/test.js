const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function checkDatabase() {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [books] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log(`Users in DB: ${users[0].count}`);
    console.log(`Books in DB: ${books[0].count}`);
    
    if (users[0].count <= 1) {
      console.log('Database is empty. Inserting dummy data...');
      
      const pwd = await bcrypt.hash('Password@123', 10);
      
      // Dummy Student
      const [u1] = await connection.execute(
        `INSERT INTO users (full_name, email, password, role, is_active, is_verified) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Test Student', 'student@test.edu', pwd, 'student', true, true]
      );
      
      // Dummy Bookstore
      const [u2] = await connection.execute(
        `INSERT INTO users (full_name, email, password, role, is_active, is_verified) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Test Bookstore User', 'store@test.com', pwd, 'bookstore', true, true]
      );
      
      // Add Bookstore profile
      await connection.execute(
        `INSERT INTO bookstores (user_id, store_name, is_approved) VALUES (?, ?, ?)`,
        [u2.insertId, 'Test Universal Books', false] // pending bookstore
      );
      
      // Dummy Book
      await connection.execute(
        `INSERT INTO books (seller_id, title, author, subject, price) VALUES (?, ?, ?, ?, ?)`,
        [u1.insertId, 'Introduction to Computer Science', 'Alan Turing', 'Computer Science', 45.00]
      );
      
      // Dummy Review
      await connection.execute(
        `INSERT INTO reviews (seller_id, reviewer_id, rating, comment, is_approved) VALUES (?, ?, ?, ?, ?)`,
        [u1.insertId, u2.insertId, 5, 'Great seller!', false]
      );
      
      // Dummy Activity log
      const [admin] = await connection.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      if (admin.length > 0) {
          await connection.execute(
            `INSERT INTO admin_logs (admin_id, action_type, description) VALUES (?, ?, ?)`,
            [admin[0].id, 'TEST_LOG', 'Admin tested the system']
          );
      }
      
      console.log('Dummy data inserted successfully!');
    } else {
      console.log('Database already has data. Admin panel should work.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

checkDatabase();
