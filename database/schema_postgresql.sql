-- ============================================
-- BookBridge Database Schema - PostgreSQL (NeonDB)
-- ============================================

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'bookstore', 'admin')),
  university VARCHAR(255),
  city VARCHAR(100),
  address TEXT,
  profile_image VARCHAR(500),
  bio TEXT,
  jazzcash_number VARCHAR(50) DEFAULT NULL,
  easypaisa_number VARCHAR(50) DEFAULT NULL,
  bank_details TEXT DEFAULT NULL,
  reset_token VARCHAR(128) DEFAULT NULL,
  reset_token_expiry TIMESTAMPTZ DEFAULT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- Bookstores Table (Premium Sellers)
-- ============================================
CREATE TABLE IF NOT EXISTS bookstores (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255) NOT NULL,
  store_description TEXT,
  registration_number VARCHAR(100) UNIQUE,
  subscription_amount DECIMAL(10,2) DEFAULT 4000.00,
  payment_method VARCHAR(20) DEFAULT NULL CHECK (payment_method IN ('jazzcash','easypaisa','bank')),
  payment_reference VARCHAR(255) DEFAULT NULL,
  payment_notes TEXT,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','verified','rejected')),
  is_approved BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_start_date DATE,
  subscription_end_date DATE,
  total_books INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_sales INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookstores_is_premium ON bookstores(is_premium);
CREATE INDEX IF NOT EXISTS idx_bookstores_is_approved ON bookstores(is_approved);
CREATE INDEX IF NOT EXISTS idx_bookstores_payment_status ON bookstores(payment_status);

-- ============================================
-- Books Table
-- ============================================
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  class_name VARCHAR(100),
  university VARCHAR(255),
  description TEXT,
  condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'not_available')),
  book_type VARCHAR(20) DEFAULT 'sale' CHECK (book_type IN ('sale', 'donate', 'exchange')),
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
);

CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_seller_id ON books(seller_id);
CREATE INDEX IF NOT EXISTS idx_books_subject ON books(subject);
CREATE INDEX IF NOT EXISTS idx_books_university ON books(university);
CREATE INDEX IF NOT EXISTS idx_books_price ON books(price);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);

-- ============================================
-- Transactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) DEFAULT 'sale' CHECK (transaction_type IN ('sale','donation','exchange')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  commission DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);

-- ============================================
-- Reviews & Ratings Table
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id INT REFERENCES transactions(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (seller_id, reviewer_id, transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- ============================================
-- Wishlist Table
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

-- ============================================
-- Admin Actions Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INT REFERENCES books(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Seed: Default Admin User (password: Admin@123)
-- ============================================
-- Run this after bcrypt hashing: $2b$10$rCvBuG6u0/Tq6Rz.L6YRqetmENRTCHr6qVjdcIXJFGxMHiVqvz1W2
-- INSERT INTO users (full_name, email, password, role, is_verified, is_active)
-- SELECT 'Admin User', 'admin@bookbridge.edu', '$2b$10$rCvBuG6u0/Tq6Rz.L6YRqetmENRTCHr6qVjdcIXJFGxMHiVqvz1W2', 'admin', TRUE, TRUE
-- WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@bookbridge.edu');
