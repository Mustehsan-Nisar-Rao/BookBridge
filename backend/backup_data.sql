-- BookBridge Data Export
-- Generated on 2026-04-01T06:33:34.119Z

CREATE DATABASE IF NOT EXISTS bookbridge;
USE bookbridge;

CREATE TABLE `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` int DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table admin_logs
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (1, 4, 'REMOVE_BOOK', 'books', 6, 'Removed by admin', '2026-04-01 01:21:13');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (2, 4, 'DELETE_USER', 'users', 3, 'Deleted user: Haris (haris@university.com)', '2026-04-01 01:21:24');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (3, 4, 'REMOVE_BOOK', 'books', 8, 'Removed by admin', '2026-04-01 01:29:13');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (4, 4, 'REMOVE_BOOK', 'books', 9, 'Removed by admin', '2026-04-01 01:31:43');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (5, 4, 'VERIFY_USER', 'users', 6, 'User verified', '2026-04-01 01:33:31');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (6, 4, 'DELETE_USER', 'users', 6, 'Deleted user: Mubashir12 (m@university.com)', '2026-04-01 01:33:56');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (7, 4, 'PAYMENT_APPROVED', 'transaction', 9, 'Admin approved payment for transaction #9', '2026-04-01 03:41:25');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (8, 4, 'PAYMENT_APPROVED', 'transaction', 10, 'Admin approved payment for transaction #10', '2026-04-01 04:08:42');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (9, 5, 'PAYMENT_APPROVED', 'transaction', 11, 'Admin approved payment for transaction #11', '2026-04-01 04:18:00');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (10, 5, 'PAYMENT_APPROVED', 'transaction', 13, 'Admin approved payment for transaction #13', '2026-04-01 04:23:52');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (11, 5, 'PAYMENT_APPROVED', 'transaction', 15, 'Admin approved payment for transaction #15', '2026-04-01 04:37:40');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (12, 5, 'PAYMENT_APPROVED', 'transaction', 16, 'Admin approved payment for transaction #16', '2026-04-01 04:51:00');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (13, 5, 'PAYMENT_APPROVED', 'transaction', 17, 'Admin approved payment for transaction #17', '2026-04-01 04:53:52');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (14, 5, 'PAYMENT_APPROVED', 'transaction', 18, 'Admin approved payment for transaction #18', '2026-04-01 05:05:39');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (15, 5, 'VERIFY_USER', 'users', 8, 'User verified', '2026-04-01 05:18:36');
INSERT INTO `admin_logs` (`id`, `admin_id`, `action_type`, `resource_type`, `resource_id`, `description`, `created_at`) VALUES (16, 5, 'VERIFY_USER', 'users', 7, 'User verified', '2026-04-01 05:18:40');

CREATE TABLE `advertisements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookstore_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `impressions` int DEFAULT '0',
  `clicks` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_bookstore_id` (`bookstore_id`),
  CONSTRAINT `advertisements_ibfk_1` FOREIGN KEY (`bookstore_id`) REFERENCES `bookstores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `university` varchar(255) DEFAULT NULL,
  `description` text,
  `condition` enum('like_new','good','fair','poor') DEFAULT 'good',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('available','sold','not_available') DEFAULT 'available',
  `book_type` enum('sale','donation') DEFAULT 'sale',
  `isbn` varchar(20) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `quantity_available` int DEFAULT '1',
  `views_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `accepted_payment_methods` varchar(255) DEFAULT 'cod',
  `jazzcash_number` varchar(50) DEFAULT NULL,
  `easypaisa_number` varchar(50) DEFAULT NULL,
  `bank_details` text,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_subject` (`subject`),
  KEY `idx_university` (`university`),
  KEY `idx_title` (`title`),
  KEY `idx_price` (`price`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_book_subject_university` (`subject`,`university`),
  KEY `idx_book_seller_status` (`seller_id`,`status`),
  CONSTRAINT `books_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table books
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (1, 1, 'king', 'william', 'Physics', '12', '', '', 'good', '1192.00', 'available', 'sale', '12', NULL, 1, 20, '2026-03-24 01:06:03', '2026-04-01 05:26:09', 'cod', NULL, NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (2, 1, 'king', 'william', 'Physics', '12', '', '', 'good', '1192.00', 'sold', 'sale', '12', NULL, 1, 9, '2026-03-24 01:06:26', '2026-04-01 02:11:11', 'cod', NULL, NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (3, 1, 'cs', 'william', 'Programming', '12', '', '', 'good', '1192.00', 'sold', 'sale', '12', NULL, 1, 18, '2026-03-24 01:07:02', '2026-04-01 01:57:36', 'cod', NULL, NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (4, 1, 'war', 'william', 'History', '12', '', '', 'good', '5.00', 'sold', 'sale', '12', NULL, 1, 28, '2026-03-24 01:53:36', '2026-04-01 01:46:54', 'cod', NULL, NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (7, 7, 'MuzammilBook', 'Muzakir', 'Biology', '12', '', '', 'good', '11.00', 'available', 'sale', '123', NULL, 1, 12, '2026-04-01 01:24:04', '2026-04-01 02:11:27', 'cod', NULL, NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (10, 7, 'x', 'sd', 'Programming', '10', '', '', 'good', '3.00', 'sold', 'sale', '232', NULL, 1, 3, '2026-04-01 01:58:09', '2026-04-01 02:10:27', 'cod', NULL, NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (11, 7, 'Book', 'Mub', 'Programming', '10', '', '', 'good', '3.00', 'sold', 'sale', '13', NULL, 1, 3, '2026-04-01 02:07:59', '2026-04-01 02:09:49', 'jazzcash', NULL, NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (12, 7, 'purchase', 'dvc', 'Mathematics', '10', '', '', 'good', '10.00', 'sold', 'sale', '232', NULL, 1, 7, '2026-04-01 02:12:22', '2026-04-01 02:14:33', 'cod,jazzcash', NULL, NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (13, 8, 'mmm', 'mm', 'Programming', '10', '', '', 'good', '117.00', 'available', 'sale', '123', NULL, 1, 8, '2026-04-01 02:47:20', '2026-04-01 02:56:21', 'jazzcash', NULL, NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (14, 2, 'kingsell', 'kingsell', 'Mathematics', '12', '', '', 'good', '3229.00', 'available', 'sale', '123', NULL, 1, 4, '2026-04-01 02:57:26', '2026-04-01 02:58:21', 'cod,jazzcash', '03106857457', NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (15, 7, 'lion', 'lion', 'Programming', '', '', '', 'good', '1226.00', 'sold', 'sale', '232', NULL, 1, 15, '2026-04-01 03:00:00', '2026-04-01 04:39:36', 'jazzcash', '03106857457', NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (16, 8, 'rrrrr', 'rrrrr', 'Physics', '12', '', '', 'good', '423.00', 'available', 'sale', '1231', NULL, 1, 4, '2026-04-01 03:05:03', '2026-04-01 06:03:17', 'cod,jazzcash', '03106857457', NULL, NULL);
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (17, 2, 'sssss', 'sssss', 'English', '12', '', '', 'good', '2417.00', 'sold', 'sale', '143', NULL, 1, 7, '2026-04-01 03:07:06', '2026-04-01 03:37:32', 'cod,jazzcash,easypaisa,bank', '03106857457', '03060067896', 'habib
ibm num:2232184234932');
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (18, 7, 'aaaa', 'aaaa', 'Chemistry', '12', '', '', 'good', '2417.00', 'sold', 'sale', '143', NULL, 1, 7, '2026-04-01 03:39:05', '2026-04-01 04:13:10', 'cod,jazzcash,easypaisa,bank', '03106857457', '03106857455', 'habib bank: 132456752234');
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (19, 7, 'ooooo', 'oo', 'Mathematics', '10', '', '', 'good', '242.00', 'sold', 'sale', 'qwe', NULL, 1, 5, '2026-04-01 04:15:20', '2026-04-01 04:18:07', 'jazzcash,easypaisa,bank,cod', '03106857457', '0314567457', 'habiib2345u43');
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (20, 7, 'zzzzzzz', 'zzz', 'Economics', '12', '', '', 'good', '21313.00', 'sold', 'sale', '232', NULL, 1, 14, '2026-04-01 04:21:04', '2026-04-01 04:23:57', 'cod,jazzcash,easypaisa,bank', '`12345', '4234324', '214314324');
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (21, 7, 'nnnn', 'nnnn', 'English', '12', '', '', 'good', '4320.00', 'sold', 'sale', '2423', NULL, 1, 10, '2026-04-01 04:48:04', '2026-04-01 04:51:09', 'cod,jazzcash,easypaisa,bank', '21356', '753', '353454254');
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (22, 5, 'vvv', 'vvv', 'History', '10', '', '', 'good', '4545.00', 'sold', 'sale', '231454', NULL, 1, 8, '2026-04-01 04:52:10', '2026-04-01 04:54:01', 'cod,jazzcash,easypaisa,bank', '123457698765', '564747456', 'mgmg 43');
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (23, 7, 'xxxx', 'xxxxx', 'History', '10', '', '', 'fair', '35433.00', 'sold', 'sale', '324', NULL, 1, 7, '2026-04-01 05:03:25', '2026-04-01 05:06:08', 'cod,jazzcash,easypaisa,bank', '2143564553', '334754', 'Meezan Bank:123424354353');
INSERT INTO `books` (`id`, `seller_id`, `title`, `author`, `subject`, `class_name`, `university`, `description`, `condition`, `price`, `status`, `book_type`, `isbn`, `image_url`, `quantity_available`, `views_count`, `created_at`, `updated_at`, `accepted_payment_methods`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (24, 9, 'e', 'e', 'English', '12', '', '', 'good', '232.00', 'available', 'sale', '232', NULL, 1, 0, '2026-04-01 06:23:15', '2026-04-01 06:23:15', 'cod', NULL, NULL, NULL);

CREATE TABLE `bookstores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `store_name` varchar(255) NOT NULL,
  `store_description` text,
  `registration_number` varchar(100) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `is_premium` tinyint(1) DEFAULT '0',
  `subscription_start_date` date DEFAULT NULL,
  `subscription_end_date` date DEFAULT NULL,
  `total_books` int DEFAULT '0',
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `total_sales` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `subscription_expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `idx_is_premium` (`is_premium`),
  KEY `idx_is_approved` (`is_approved`),
  CONSTRAINT `bookstores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table bookstores
INSERT INTO `bookstores` (`id`, `user_id`, `store_name`, `store_description`, `registration_number`, `is_approved`, `is_premium`, `subscription_start_date`, `subscription_end_date`, `total_books`, `average_rating`, `total_sales`, `created_at`, `updated_at`, `subscription_expires_at`) VALUES (1, 2, 'Test Store', NULL, NULL, 1, 1, NULL, NULL, 0, '0.00', 0, '2026-04-01 06:14:25', '2026-04-01 06:14:25', '2027-04-01 06:14:25');

CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `book_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `transaction_id` int DEFAULT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comment` text,
  `is_approved` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review` (`seller_id`,`reviewer_id`,`transaction_id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table reviews
INSERT INTO `reviews` (`id`, `seller_id`, `reviewer_id`, `transaction_id`, `rating`, `title`, `comment`, `is_approved`, `created_at`, `updated_at`) VALUES (2, 1, 2, NULL, 5, '', '', 1, '2026-03-24 02:19:42', '2026-03-24 02:19:42');

CREATE TABLE `search_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `search_query` varchar(255) NOT NULL,
  `filters` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `search_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `seller_id` int NOT NULL,
  `buyer_id` int NOT NULL,
  `transaction_type` enum('sale','donation','exchange') DEFAULT 'sale',
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `commission` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(50) DEFAULT NULL,
  `notes` text,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `transaction_reference` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_transaction_book_seller` (`book_id`,`seller_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table transactions
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (1, 4, 1, 7, 'sale', 'pending', '5.00', '0.50', 'easypaisa', '', NULL, '2026-04-01 01:46:42', '2026-04-01 01:46:42', NULL);
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (2, 3, 1, 7, 'sale', 'pending', '1192.00', '119.20', 'cod', '', NULL, '2026-04-01 01:57:34', '2026-04-01 01:57:34', NULL);
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (3, 11, 7, 8, 'sale', 'pending', '3.00', '0.30', 'cod', '', NULL, '2026-04-01 02:09:46', '2026-04-01 02:09:46', NULL);
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (4, 10, 7, 8, 'sale', 'pending', '3.00', '0.30', 'cod', '', NULL, '2026-04-01 02:10:23', '2026-04-01 02:10:23', NULL);
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (5, 2, 1, 7, 'sale', 'pending', '1192.00', '119.20', 'cod', '', NULL, '2026-04-01 02:11:09', '2026-04-01 02:11:09', NULL);
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (6, 12, 7, 8, 'sale', 'pending', '10.00', '1.00', 'cod', '', NULL, '2026-04-01 02:14:32', '2026-04-01 02:14:32', NULL);
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (7, 17, 2, 7, 'sale', 'pending', '2417.00', '241.70', 'easypaisa', '', NULL, '2026-04-01 03:21:34', '2026-04-01 03:21:34', '1234651324563');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (8, 18, 7, 8, 'sale', 'pending', '2417.00', '241.70', 'jazzcash', '', NULL, '2026-04-01 03:39:36', '2026-04-01 03:39:36', '237666453245');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (9, 18, 7, 8, 'sale', 'completed', '2417.00', '241.70', 'jazzcash', '', '2026-04-01 03:41:25', '2026-04-01 03:40:29', '2026-04-01 03:41:25', '237666453245');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (10, 18, 7, 4, 'sale', 'completed', '2417.00', '241.70', 'jazzcash', '', '2026-04-01 04:08:42', '2026-04-01 03:41:13', '2026-04-01 04:08:42', '237666453245');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (11, 19, 7, 8, 'sale', 'completed', '242.00', '24.20', 'jazzcash', '', '2026-04-01 04:18:00', '2026-04-01 04:17:09', '2026-04-01 04:18:00', '12437643456');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (12, 20, 7, 8, 'sale', 'pending', '21313.00', '2131.30', 'jazzcash', '', NULL, '2026-04-01 04:21:48', '2026-04-01 04:21:48', '13245671233');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (13, 20, 7, 8, 'sale', 'completed', '21313.00', '2131.30', 'jazzcash', '', '2026-04-01 04:23:52', '2026-04-01 04:23:00', '2026-04-01 04:23:52', '4565432453');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (14, 15, 7, 5, 'sale', 'pending', '1226.00', '122.60', 'jazzcash', '', NULL, '2026-04-01 04:25:34', '2026-04-01 04:25:34', 'zfd');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (15, 15, 7, 5, 'sale', 'completed', '1226.00', '122.60', 'jazzcash', '', '2026-04-01 04:37:40', '2026-04-01 04:35:38', '2026-04-01 04:37:40', '324234234');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (16, 21, 7, 8, 'sale', 'completed', '4320.00', '432.00', 'jazzcash', '', '2026-04-01 04:51:00', '2026-04-01 04:50:15', '2026-04-01 04:51:00', '766453231456');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (17, 22, 5, 8, 'sale', 'completed', '4545.00', '454.50', 'jazzcash', '', '2026-04-01 04:53:52', '2026-04-01 04:53:09', '2026-04-01 04:53:52', '2345764324');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (18, 23, 7, 8, 'sale', 'completed', '35433.00', '3543.30', 'jazzcash', '', '2026-04-01 05:05:39', '2026-04-01 05:05:00', '2026-04-01 05:05:39', '4545435313132223232');
INSERT INTO `transactions` (`id`, `book_id`, `seller_id`, `buyer_id`, `transaction_type`, `status`, `amount`, `commission`, `payment_method`, `notes`, `completed_at`, `created_at`, `updated_at`, `transaction_reference`) VALUES (19, 1, 1, 8, 'sale', 'pending', '1192.00', '119.20', 'cod', '', NULL, '2026-04-01 05:26:06', '2026-04-01 05:26:06', NULL);

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('student','bookstore','admin') DEFAULT 'student',
  `university` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text,
  `profile_image` varchar(500) DEFAULT NULL,
  `bio` text,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `jazzcash_number` varchar(50) DEFAULT NULL,
  `easypaisa_number` varchar(50) DEFAULT NULL,
  `bank_details` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table users
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `university`, `city`, `address`, `profile_image`, `bio`, `is_verified`, `is_active`, `created_at`, `updated_at`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (1, 'Mubashir', 'mubashir@university.com', '$2a$10$f9fWHu.SJEI2DhfYlttBCeoPRL9AizEP.X9rLggxVRP5PaSLsgih6', '03106857457', 'student', 'fast', 'Multan', 'fast university hostel', NULL, 'hy', 0, 1, '2026-03-24 00:48:39', '2026-03-24 02:16:29', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `university`, `city`, `address`, `profile_image`, `bio`, `is_verified`, `is_active`, `created_at`, `updated_at`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (2, 'anas', 'mub@university.com', '$2a$10$8DQF.dvV96LcFzqklQ/2hOERKcqOMF1oSbrZthSfvdMyhrnHmGi0.', '03106857457', 'bookstore', 'numl', 'Multan', 'fast university hostel', NULL, '', 0, 1, '2026-03-24 01:20:55', '2026-03-24 09:22:10', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `university`, `city`, `address`, `profile_image`, `bio`, `is_verified`, `is_active`, `created_at`, `updated_at`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (4, 'Admin User', 'admin@bookbridge.edu', '$2a$10$L9RPcS78F4y7sZV0Oy.9peZ61bI6Bkh8./pLkn75G3GHu57yyUvJ.', NULL, 'admin', NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-24 11:03:21', '2026-03-24 11:03:21', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `university`, `city`, `address`, `profile_image`, `bio`, `is_verified`, `is_active`, `created_at`, `updated_at`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (5, 'admin', 'admin@book.edu', '$2a$10$Piyj4821t9s45eSC0Fm0UOMXhDyG0ChWkZ9JxONh6eZz6VZXvKyvO', NULL, 'admin', 'fast', NULL, NULL, NULL, NULL, 0, 1, '2026-03-31 17:20:20', '2026-03-31 17:20:20', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `university`, `city`, `address`, `profile_image`, `bio`, `is_verified`, `is_active`, `created_at`, `updated_at`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (7, 'Muzammil', 'muzammail@university.com', '$2a$10$QfAofrxXUmNOohJw2uUY0eWqsj/ktT.GeW/yA76OPlUbaieXRw1a6', '03060068786', 'bookstore', 'numl', 'Multan', 'fast university hostel', NULL, 'mu', 1, 1, '2026-04-01 01:23:26', '2026-04-01 05:18:40', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `university`, `city`, `address`, `profile_image`, `bio`, `is_verified`, `is_active`, `created_at`, `updated_at`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (8, 'king', 'k@university.com', '$2a$10$athHHlp3Nn6CktTqhxRqD.Y23tfE4L0y.RKYo.g/gD3t3R38TI61S', NULL, 'student', 'numl', NULL, NULL, NULL, NULL, 1, 1, '2026-04-01 02:09:20', '2026-04-01 05:18:36', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `university`, `city`, `address`, `profile_image`, `bio`, `is_verified`, `is_active`, `created_at`, `updated_at`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (9, 'king123', 'kin@university.com', '$2a$10$KV5CJxCPOaAAIVr1DdRX6eiMJbVQhIqNE2YL5LGA6/ZXJTf0yv7Fa', NULL, 'bookstore', 'numl', NULL, NULL, NULL, NULL, 0, 1, '2026-04-01 05:55:51', '2026-04-01 05:55:51', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `university`, `city`, `address`, `profile_image`, `bio`, `is_verified`, `is_active`, `created_at`, `updated_at`, `jazzcash_number`, `easypaisa_number`, `bank_details`) VALUES (10, 'king123', 'kl@university.com', '$2a$10$6B3LnAybb5YDo4zMxWve.ugGow93k37ZdkaRclK/k9I1t8/1PtOZC', NULL, 'bookstore', 'numl', NULL, NULL, NULL, NULL, 0, 1, '2026-04-01 06:17:57', '2026-04-01 06:17:57', NULL, NULL, NULL);

CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`user_id`,`book_id`),
  KEY `book_id` (`book_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

