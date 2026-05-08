-- ============================================
-- BookBridge Database Schema
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS bookbridge;
USE bookbridge;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('student', 'bookstore', 'admin') DEFAULT 'student',
  university VARCHAR(255),
  city VARCHAR(100),
  address TEXT,
  profile_image VARCHAR(500),
  bio TEXT,
  jazzcash_number VARCHAR(50) DEFAULT NULL,
  easypaisa_number VARCHAR(50) DEFAULT NULL,
  bank_details TEXT DEFAULT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- Bookstores Table (Premium Sellers)
-- ============================================
CREATE TABLE bookstores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  store_name VARCHAR(255) NOT NULL,
  store_description TEXT,
  registration_number VARCHAR(100) UNIQUE,
  subscription_amount DECIMAL(10,2) DEFAULT 4000.00,
  payment_method ENUM('jazzcash','easypaisa','bank') DEFAULT NULL,
  payment_reference VARCHAR(255) DEFAULT NULL,
  payment_notes TEXT,
  payment_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  is_approved BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_start_date DATE,
  subscription_end_date DATE,
  total_books INT DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_sales INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_is_premium (is_premium),
  INDEX idx_is_approved (is_approved),
  INDEX idx_payment_status (payment_status)
);

-- ============================================
-- Books Table
-- ============================================
CREATE TABLE books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  class_name VARCHAR(100),
  university VARCHAR(255),
   description TEXT,
  `condition` ENUM('like_new', 'good', 'fair', 'poor') DEFAULT 'good',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('available', 'sold', 'not_available') DEFAULT 'available',
  book_type ENUM('sale', 'donation') DEFAULT 'sale',
  isbn VARCHAR(20),
  image_url VARCHAR(500),
  quantity_available INT DEFAULT 1,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_seller_id (seller_id),
  INDEX idx_subject (subject),
  INDEX idx_university (university),
  INDEX idx_title (title),
  INDEX idx_price (price),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- Transactions Table
-- ============================================
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL,
  seller_id INT NOT NULL,
  buyer_id INT NOT NULL,
  transaction_type ENUM('sale', 'donation', 'exchange') DEFAULT 'sale',
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  commission DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50),
  notes TEXT,
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_seller_id (seller_id),
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- Reviews & Ratings Table
-- ============================================
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  transaction_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
  INDEX idx_seller_id (seller_id),
  INDEX idx_reviewer_id (reviewer_id),
  INDEX idx_rating (rating),
  UNIQUE KEY unique_review (seller_id, reviewer_id, transaction_id)
);

-- ============================================
-- Wishlist Table
-- ============================================
CREATE TABLE wishlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (user_id, book_id),
  INDEX idx_user_id (user_id)
);

-- ============================================
-- Advertisements Table
-- ============================================
CREATE TABLE advertisements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bookstore_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bookstore_id) REFERENCES bookstores(id) ON DELETE CASCADE,
  INDEX idx_is_active (is_active),
  INDEX idx_bookstore_id (bookstore_id)
);

-- ============================================
-- Messages Table (For Buyer-Seller Communication)
-- ============================================
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  book_id INT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- Admin Actions Log Table
-- ============================================
CREATE TABLE admin_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- Search History Table
-- ============================================
CREATE TABLE search_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  search_query VARCHAR(255) NOT NULL,
  filters JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- Create Indexes for Performance
-- ============================================
CREATE INDEX idx_book_subject_university ON books(subject, university);
CREATE INDEX idx_book_seller_status ON books(seller_id, status);
CREATE INDEX idx_transaction_book_seller ON transactions(book_id, seller_id);

-- ============================================
-- Sample Data (Optional)
-- ============================================
-- Note: Remove these if not needed

-- Insert sample admin user (password: Admin@123)
-- INSERT INTO users (full_name, email, password, role, is_verified, is_active)
-- VALUES ('Admin User', 'admin@bookbridge.test', '$2b$10$YOUR_HASHED_PASSWORD_HERE', 'admin', TRUE, TRUE);

COMMIT;
