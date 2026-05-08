/**
 * NeonDB PostgreSQL Setup Script - Smart Version
 * Run: node setup-neondb.js
 * 
 * Checks existing tables and adds missing columns/tables.
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runQuery(client, sql, params = []) {
  try {
    const result = await client.query(sql, params);
    return result;
  } catch (err) {
    console.warn(`  ⚠️  ${err.message.substring(0, 100)}`);
    return null;
  }
}

async function tableExists(client, tableName) {
  const result = await client.query(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)",
    [tableName]
  );
  return result.rows[0].exists;
}

async function columnExists(client, tableName, columnName) {
  const result = await client.query(
    "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2)",
    [tableName, columnName]
  );
  return result.rows[0].exists;
}

async function setup() {
  const client = await pool.connect();
  try {
    console.log('🔄 Connecting to NeonDB...');
    await client.query('SELECT 1');
    console.log('✅ Connected to NeonDB!\n');

    // =====================
    // USERS TABLE
    // =====================
    console.log('📋 Setting up users table...');
    const usersExists = await tableExists(client, 'users');
    if (!usersExists) {
      await runQuery(client, `
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          role VARCHAR(20) DEFAULT 'student',
          university VARCHAR(255),
          city VARCHAR(100),
          address TEXT,
          profile_image VARCHAR(500),
          bio TEXT,
          jazzcash_number VARCHAR(50),
          easypaisa_number VARCHAR(50),
          bank_details TEXT,
          reset_token VARCHAR(128),
          reset_token_expiry TIMESTAMPTZ,
          is_verified BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('  ✅ users table created');
    } else {
      console.log('  ✅ users table exists — checking columns...');
      // Add missing columns
      const missingCols = [
        { name: 'reset_token', def: 'VARCHAR(128)' },
        { name: 'reset_token_expiry', def: 'TIMESTAMPTZ' },
        { name: 'jazzcash_number', def: 'VARCHAR(50)' },
        { name: 'easypaisa_number', def: 'VARCHAR(50)' },
        { name: 'bank_details', def: 'TEXT' },
        { name: 'university', def: 'VARCHAR(255)' },
        { name: 'bio', def: 'TEXT' },
        { name: 'profile_image', def: 'VARCHAR(500)' },
        { name: 'city', def: 'VARCHAR(100)' },
        { name: 'address', def: 'TEXT' },
        { name: 'phone', def: 'VARCHAR(20)' },
        { name: 'is_verified', def: 'BOOLEAN DEFAULT FALSE' },
        { name: 'is_active', def: 'BOOLEAN DEFAULT TRUE' },
        { name: 'updated_at', def: 'TIMESTAMPTZ DEFAULT NOW()' }
      ];
      for (const col of missingCols) {
        const exists = await columnExists(client, 'users', col.name);
        if (!exists) {
          await runQuery(client, `ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`);
          console.log(`  ➕ Added column: ${col.name}`);
        }
      }
    }

    await runQuery(client, 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await runQuery(client, 'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');

    // =====================
    // BOOKSTORES TABLE
    // =====================
    console.log('\n📋 Setting up bookstores table...');
    const bookstoresExists = await tableExists(client, 'bookstores');
    if (!bookstoresExists) {
      await runQuery(client, `
        CREATE TABLE bookstores (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          store_name VARCHAR(255) NOT NULL,
          store_description TEXT,
          registration_number VARCHAR(100) UNIQUE,
          subscription_amount DECIMAL(10,2) DEFAULT 4000.00,
          payment_method VARCHAR(20),
          payment_reference VARCHAR(255),
          payment_notes TEXT,
          payment_status VARCHAR(20) DEFAULT 'pending',
          is_approved BOOLEAN DEFAULT FALSE,
          is_premium BOOLEAN DEFAULT FALSE,
          subscription_start_date DATE,
          subscription_end_date DATE,
          total_books INT DEFAULT 0,
          average_rating DECIMAL(3,2) DEFAULT 0.00,
          total_sales INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('  ✅ bookstores table created');
    } else {
      console.log('  ✅ bookstores table already exists');
    }

    // =====================
    // BOOKS TABLE
    // =====================
    console.log('\n📋 Setting up books table...');
    const booksExists = await tableExists(client, 'books');
    if (!booksExists) {
      await runQuery(client, `
        CREATE TABLE books (
          id SERIAL PRIMARY KEY,
          seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          subject VARCHAR(100) NOT NULL,
          class_name VARCHAR(100),
          university VARCHAR(255),
          description TEXT,
          condition VARCHAR(20) DEFAULT 'good',
          price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          status VARCHAR(20) DEFAULT 'available',
          book_type VARCHAR(20) DEFAULT 'sale',
          isbn VARCHAR(20),
          image_url VARCHAR(500),
          quantity_available INT DEFAULT 1,
          views_count INT DEFAULT 0,
          accepted_payment_methods VARCHAR(100) DEFAULT 'cod',
          jazzcash_number VARCHAR(50),
          easypaisa_number VARCHAR(50),
          bank_details TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('  ✅ books table created');
    } else {
      console.log('  ✅ books table exists — checking columns...');
      const bookCols = [
        { name: 'accepted_payment_methods', def: "VARCHAR(100) DEFAULT 'cod'" },
        { name: 'jazzcash_number', def: 'VARCHAR(50)' },
        { name: 'easypaisa_number', def: 'VARCHAR(50)' },
        { name: 'bank_details', def: 'TEXT' },
        { name: 'book_type', def: "VARCHAR(20) DEFAULT 'sale'" },
        { name: 'views_count', def: 'INT DEFAULT 0' }
      ];
      for (const col of bookCols) {
        const exists = await columnExists(client, 'books', col.name);
        if (!exists) {
          await runQuery(client, `ALTER TABLE books ADD COLUMN ${col.name} ${col.def}`);
          console.log(`  ➕ Added column: books.${col.name}`);
        }
      }
    }

    // =====================
    // TRANSACTIONS TABLE
    // =====================
    console.log('\n📋 Setting up transactions table...');
    const transactionsExists = await tableExists(client, 'transactions');
    if (!transactionsExists) {
      await runQuery(client, `
        CREATE TABLE transactions (
          id SERIAL PRIMARY KEY,
          book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          transaction_type VARCHAR(20) DEFAULT 'sale',
          status VARCHAR(20) DEFAULT 'pending',
          amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          commission DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          payment_method VARCHAR(50),
          payment_reference VARCHAR(255),
          notes TEXT,
          completed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('  ✅ transactions table created');
    } else {
      console.log('  ✅ transactions table already exists');
    }

    // =====================
    // REVIEWS TABLE
    // =====================
    console.log('\n📋 Setting up reviews table...');
    const reviewsExists = await tableExists(client, 'reviews');
    if (!reviewsExists) {
      await runQuery(client, `
        CREATE TABLE reviews (
          id SERIAL PRIMARY KEY,
          seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          transaction_id INT REFERENCES transactions(id) ON DELETE SET NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          comment TEXT,
          is_approved BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('  ✅ reviews table created');
    } else {
      console.log('  ✅ reviews table already exists');
    }

    // =====================
    // ADMIN LOGS TABLE
    // =====================
    console.log('\n📋 Setting up admin_logs table...');
    const logsExists = await tableExists(client, 'admin_logs');
    if (!logsExists) {
      await runQuery(client, `
        CREATE TABLE admin_logs (
          id SERIAL PRIMARY KEY,
          admin_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          action_type VARCHAR(100) NOT NULL,
          resource_type VARCHAR(50),
          resource_id INT,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('  ✅ admin_logs table created');
    } else {
      console.log('  ✅ admin_logs table already exists');
    }

    // =====================
    // MESSAGES TABLE
    // =====================
    console.log('\n📋 Setting up messages table...');
    const messagesExists = await tableExists(client, 'messages');
    if (!messagesExists) {
      await runQuery(client, `
        CREATE TABLE messages (
          id SERIAL PRIMARY KEY,
          sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          book_id INT REFERENCES books(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('  ✅ messages table created');
    } else {
      console.log('  ✅ messages table already exists');
    }

    // =====================
    // SEED ADMIN USER
    // =====================
    console.log('\n🔐 Checking admin user...');
    const adminEmail = 'admin@bookbridge.edu';
    const adminResult = await client.query(
      "SELECT id FROM users WHERE email = $1", [adminEmail]
    );

    if (adminResult.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await client.query(
        `INSERT INTO users (full_name, email, password, role, is_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Admin User', adminEmail, hashedPassword, 'admin', true, true]
      );
      console.log('  ✅ Admin user created!');
      console.log('     Email: admin@bookbridge.edu');
      console.log('     Password: Admin@123');
    } else {
      console.log('  ✅ Admin user already exists.');
    }

    console.log('\n🎉 NeonDB setup complete! Your BookBridge database is ready.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
