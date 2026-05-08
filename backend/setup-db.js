const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      multipleStatements: true
    });
    console.log("Connected to MySQL. Creating database...");
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);
    
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      console.log("Importing schema...");
      const statements = schema.split(';').filter(stm => stm.trim() !== '');
      for (let stm of statements) {
        try {
          if (stm.trim()) {
            await connection.query(stm);
          }
        } catch(e) {
          if(e.code !== 'ER_TABLE_EXISTS_ERROR' && e.code !== 'ER_DUP_KEYNAME') {
             console.warn("Skipping expected error:", e.message);
          }
        }
      }
      console.log("Schema imported successfully! Existing tables were preserved.");
    } else {
      console.log("Schema file not found at " + schemaPath);
    }

    // ============================================
    // Seed default admin user
    // ============================================
    console.log("Checking for admin user...");
    const [existingAdmin] = await connection.query(
      "SELECT id FROM users WHERE email = 'admin@bookbridge.edu' AND role = 'admin'"
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await connection.query(
        `INSERT INTO users (full_name, email, password, role, is_verified, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Admin User', 'admin@bookbridge.edu', hashedPassword, 'admin', true, true]
      );
      console.log("✅ Admin user created: admin@bookbridge.edu / Admin@123");
    } else {
      console.log("✅ Admin user already exists.");
    }
    
    await connection.end();
    console.log("Database setup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Database setup failed:", err);
    process.exit(1);
  }
}

setup();
