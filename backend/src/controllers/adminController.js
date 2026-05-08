// Admin Controller

const { pool } = require('../config/database');
const { sendResponse, sendError } = require('../utils/helpers');
const { emitAdminDataUpdate, emitTransactionUpdate, emitBookStatusChange } = require('../config/socket');
const constants = require('../config/constants');

/**
 * Helper function to log admin actions
 */
const logAdminAction = async (connection, adminId, actionType, resourceType, resourceId, description) => {
  try {
    await connection.execute(
      `INSERT INTO admin_logs (admin_id, action_type, resource_type, resource_id, description)
       VALUES (?, ?, ?, ?, ?)`,
      [adminId, actionType, resourceType, resourceId, description]
    );
  } catch (error) {
    console.error('Log admin action error:', error);
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Get all users
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();
    try {
      let query = 'SELECT id, full_name, email, role, university, is_verified, is_active, created_at FROM users WHERE 1=1';
      const params = [];

      if (search) {
        query += ' AND (full_name LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      if (status === 'active') {
        query += ' AND is_active = TRUE';
      } else if (status === 'suspended') {
        query += ' AND is_active = FALSE';
      } else if (status === 'unverified') {
        query += ' AND is_verified = FALSE';
      }

      // Count query
      let countQuery = query.replace('SELECT id, full_name, email, role, university, is_verified, is_active, created_at', 'SELECT COUNT(*) as total');
      const [countResult] = await connection.execute(countQuery, [...params]);

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(String(parseInt(limit)), String(offset));

      const [users] = await connection.execute(query, params);

      return sendResponse(res, 200, true, 'Users retrieved.', {
        users,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        currentPage: parseInt(page)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get users error:', error);
    return sendError(res, 500, 'Failed to retrieve users.');
  }
};

/**
 * Verify user
 * PUT /api/admin/users/:userId/verify
 */
const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = ?',
        [userId]
      );

      if (result.affectedRows === 0) {
        return sendError(res, 404, 'User not found.');
      }

      await logAdminAction(connection, req.user.userId, 'VERIFY_USER', 'users', userId, 'User verified');
      return sendResponse(res, 200, true, 'User verified successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Verify user error:', error);
    return sendError(res, 500, 'Failed to verify user.');
  }
};

/**
 * Suspend user
 * PUT /api/admin/users/:userId/suspend
 */
const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await pool.getConnection();
    try {
      // Prevent suspending yourself
      if (parseInt(userId) === req.user.userId) {
        return sendError(res, 400, 'You cannot suspend your own account.');
      }

      const [result] = await connection.execute(
        'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
        [userId]
      );

      if (result.affectedRows === 0) {
        return sendError(res, 404, 'User not found.');
      }

      await logAdminAction(connection, req.user.userId, 'SUSPEND_USER', 'users', userId, 'User suspended');
      return sendResponse(res, 200, true, 'User suspended successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Suspend user error:', error);
    return sendError(res, 500, 'Failed to suspend user.');
  }
};

/**
 * Activate (unsuspend) user
 * PUT /api/admin/users/:userId/activate
 */
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE users SET is_active = TRUE, updated_at = NOW() WHERE id = ?',
        [userId]
      );

      if (result.affectedRows === 0) {
        return sendError(res, 404, 'User not found.');
      }

      await logAdminAction(connection, req.user.userId, 'ACTIVATE_USER', 'users', userId, 'User reactivated');
      return sendResponse(res, 200, true, 'User activated successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Activate user error:', error);
    return sendError(res, 500, 'Failed to activate user.');
  }
};

/**
 * Delete user permanently
 * DELETE /api/admin/users/:userId
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await pool.getConnection();
    try {
      // Prevent deleting yourself
      if (parseInt(userId) === req.user.userId) {
        return sendError(res, 400, 'You cannot delete your own account.');
      }

      // Check if user exists and get info for logging
      const [users] = await connection.execute('SELECT full_name, email, role FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return sendError(res, 404, 'User not found.');
      }

      const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

      await logAdminAction(connection, req.user.userId, 'DELETE_USER', 'users', userId,
        `Deleted user: ${users[0].full_name} (${users[0].email})`);

      return sendResponse(res, 200, true, 'User deleted successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return sendError(res, 500, 'Failed to delete user.');
  }
};

// ============================================
// BOOKSTORE MANAGEMENT
// ============================================

/**
 * Get bookstore requests
 * GET /api/admin/bookstores
 */
const getBookstoreRequests = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();
    try {
      let query = `SELECT b.*, u.full_name, u.email, u.university,
         b.payment_method, b.payment_reference, b.payment_status, b.subscription_amount, b.registration_number
         FROM bookstores b
         JOIN users u ON b.user_id = u.id`;
      const params = [];

      if (status === 'pending') {
        query += ' WHERE b.is_approved = FALSE';
      } else if (status === 'approved') {
        query += ' WHERE b.is_approved = TRUE';
      }

      // Count
      // Robustly replace the SELECT clause for count
      let countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const [countResult] = await connection.execute(countQuery, [...params]);

      query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
      params.push(String(parseInt(limit)), String(offset));

      const [bookstores] = await connection.execute(query, params);

      return sendResponse(res, 200, true, 'Bookstore requests retrieved.', {
        bookstores,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        currentPage: parseInt(page)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get bookstore requests error:', error);
    return sendError(res, 500, 'Failed to retrieve bookstore requests.');
  }
};

/**
 * Approve bookstore
 * PUT /api/admin/bookstores/:bookstoreId/approve
 */
const approveBookstore = async (req, res) => {
  try {
    const { bookstoreId } = req.params;

    const connection = await pool.getConnection();
    try {
      const [bookstoreRows] = await connection.execute(
        'SELECT user_id FROM bookstores WHERE id = ?',
        [bookstoreId]
      );

      if (bookstoreRows.length === 0) {
        return sendError(res, 404, 'Bookstore not found.');
      }

      const userId = bookstoreRows[0].user_id;

      await connection.execute(
        `UPDATE bookstores SET is_approved = TRUE, payment_status = 'verified', subscription_start_date = NOW(), subscription_end_date = NOW() + INTERVAL '1 year', updated_at = NOW() WHERE id = ?`,
        [bookstoreId]
      );

      await connection.execute(
        'UPDATE users SET is_active = TRUE, is_verified = TRUE, updated_at = NOW() WHERE id = ?',
        [userId]
      );

      await logAdminAction(connection, req.user.userId, 'APPROVE_BOOKSTORE', 'bookstores', bookstoreId, 'Bookstore approved and payment verified');
      
      // 💡 Broadcast update
      emitAdminDataUpdate();

      return sendResponse(res, 200, true, 'Bookstore approved successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Approve bookstore error:', error);
    return sendError(res, 500, 'Failed to approve bookstore.');
  }
};

/**
 * Reject bookstore
 * PUT /api/admin/bookstores/:bookstoreId/reject
 */
const rejectBookstore = async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const { reason } = req.body;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM bookstores WHERE id = ?',
        [bookstoreId]
      );

      if (result.affectedRows === 0) {
        return sendError(res, 404, 'Bookstore not found.');
      }

      await logAdminAction(connection, req.user.userId, 'REJECT_BOOKSTORE', 'bookstores', bookstoreId,
        reason || 'Bookstore application rejected');
      
      // 💡 Broadcast update
      emitAdminDataUpdate();

      return sendResponse(res, 200, true, 'Bookstore rejected successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Reject bookstore error:', error);
    return sendError(res, 500, 'Failed to reject bookstore.');
  }
};

// ============================================
// BOOK/CONTENT MANAGEMENT
// ============================================

/**
 * Get all books (admin)
 * GET /api/admin/books
 */
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();
    try {
      let query = `SELECT b.*, b."class" AS class_name, u.full_name as seller_name, u.email as seller_email
         FROM books b
         JOIN users u ON b.seller_id = u.id
         WHERE 1=1`;
      const params = [];

      if (search) {
        query += ' AND (b.title LIKE ? OR b.author LIKE ? OR u.full_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      let countQuery = query.replace(/SELECT b\.\*, b\."class" AS class_name, u\.full_name as seller_name, u\.email as seller_email/, 'SELECT COUNT(*) as total');
      const [countResult] = await connection.execute(countQuery, [...params]);

      query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
      params.push(String(parseInt(limit)), String(offset));

      const [books] = await connection.execute(query, params);

      return sendResponse(res, 200, true, 'Books retrieved.', {
        books,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        currentPage: parseInt(page)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get all books error:', error);
    return sendError(res, 500, 'Failed to retrieve books.');
  }
};

/**
 * Remove book
 * DELETE /api/admin/books/:bookId
 */
const removeBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { reason } = req.body;

    const connection = await pool.getConnection();
    try {
      // Get book info for logging
      const [books] = await connection.execute('SELECT title, seller_id FROM books WHERE id = ?', [bookId]);
      if (books.length === 0) {
        return sendError(res, 404, 'Book not found.');
      }

      await connection.execute('DELETE FROM books WHERE id = ?', [bookId]);

      await logAdminAction(connection, req.user.userId, 'REMOVE_BOOK', 'books', bookId,
        reason || `Removed book: ${books[0].title}`);
      
      // 💡 Broadcast update
      emitAdminDataUpdate();
      emitBookStatusChange(bookId, { status: 'deleted' });

      return sendResponse(res, 200, true, 'Book removed successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Remove book error:', error);
    return sendError(res, 500, 'Failed to remove book.');
  }
};

// ============================================
// REVIEW MODERATION
// ============================================

/**
 * Get all reviews
 * GET /api/admin/reviews
 */
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();
    try {
      const [reviews] = await connection.execute(
        `SELECT r.*, 
                reviewer.full_name as reviewer_name,
                seller.full_name as seller_name
         FROM reviews r
         JOIN users reviewer ON r.reviewer_id = reviewer.id
         JOIN users seller ON r.seller_id = seller.id
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
        [String(parseInt(limit)), String(offset)]
      );

      const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM reviews');

      return sendResponse(res, 200, true, 'Reviews retrieved.', {
        reviews,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        currentPage: parseInt(page)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get reviews error:', error);
    return sendError(res, 500, 'Failed to retrieve reviews.');
  }
};

/**
 * Approve review
 * PUT /api/admin/reviews/:reviewId/approve
 */
const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE reviews SET is_approved = TRUE WHERE id = ?',
        [reviewId]
      );

      if (result.affectedRows === 0) {
        return sendError(res, 404, 'Review not found.');
      }

      await logAdminAction(connection, req.user.userId, 'APPROVE_REVIEW', 'reviews', reviewId, 'Review approved');
      return sendResponse(res, 200, true, 'Review approved successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Approve review error:', error);
    return sendError(res, 500, 'Failed to approve review.');
  }
};

/**
 * Reject (delete) review
 * DELETE /api/admin/reviews/:reviewId
 */
const rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);

      if (result.affectedRows === 0) {
        return sendError(res, 404, 'Review not found.');
      }

      await logAdminAction(connection, req.user.userId, 'REJECT_REVIEW', 'reviews', reviewId, 'Review rejected and removed');
      return sendResponse(res, 200, true, 'Review rejected successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Reject review error:', error);
    return sendError(res, 500, 'Failed to reject review.');
  }
};

// ============================================
// STATISTICS & LOGS
// ============================================

/**
 * Get platform statistics (enhanced)
 * GET /api/admin/statistics
 */
const getPlatformStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Total users
      const [userStats] = await connection.execute('SELECT COUNT(*) as total FROM users');

      // Users by role
      const [roleBreakdown] = await connection.execute(
        'SELECT role, COUNT(*) as count FROM users GROUP BY role'
      );

      // Active vs inactive users
      const [activeUsers] = await connection.execute(
        'SELECT COUNT(*) as total FROM users WHERE is_active = TRUE'
      );
      const [suspendedUsers] = await connection.execute(
        'SELECT COUNT(*) as total FROM users WHERE is_active = FALSE'
      );

      // Unverified users
      const [unverifiedUsers] = await connection.execute(
        'SELECT COUNT(*) as total FROM users WHERE is_verified = FALSE'
      );

      // New users this month
      const [newUsersMonth] = await connection.execute(
        'SELECT COUNT(*) as total FROM users WHERE created_at >= NOW() - INTERVAL \'30 days\''
      );

      // Bookstores
      const [approvedBookstores] = await connection.execute(
        'SELECT COUNT(*) as total FROM bookstores WHERE is_approved = TRUE'
      );
      const [pendingBookstores] = await connection.execute(
        'SELECT COUNT(*) as total FROM bookstores WHERE is_approved = FALSE'
      );

      // Books
      const [bookStats] = await connection.execute('SELECT COUNT(*) as total FROM books');
      const [availableBooks] = await connection.execute(
        "SELECT COUNT(*) as total FROM books WHERE status = 'available'"
      );

      // Transactions
      const [transactionStats] = await connection.execute(
        'SELECT COUNT(*) as total, COALESCE(SUM(amount), 0) as revenue FROM transactions WHERE status = \'completed\''
      );

      // Commissions from sales (1%)
      const [commissionStats] = await connection.execute(
        'SELECT COALESCE(SUM(commission), 0) as total FROM transactions WHERE status = \'completed\''
      );

      // Revenue from Bookstore Subscriptions (Rs. 4,000 each)
      const [subscriptionStats] = await connection.execute(
        'SELECT COALESCE(SUM(subscription_amount), 0) as total FROM bookstores WHERE is_approved = TRUE'
      );

      const totalEarnings = (Number(commissionStats[0].total) + Number(subscriptionStats[0].total));

      // Total reviews
      const [reviewStats] = await connection.execute('SELECT COUNT(*) as total FROM reviews');

      // Pending Transactions
      const [pendingTransactions] = await connection.execute(
        'SELECT COUNT(*) as total FROM transactions WHERE status = \'pending\''
      );

      // Build role breakdown map
      const roles = {};
      roleBreakdown.forEach(r => { roles[r.role] = r.count; });

      return sendResponse(res, 200, true, 'Platform statistics retrieved.', {
        total_users: userStats[0].total,
        active_users: activeUsers[0].total,
        suspended_users: suspendedUsers[0].total,
        unverified_users: unverifiedUsers[0].total,
        new_users_month: newUsersMonth[0].total,
        students: roles['student'] || 0,
        bookstore_users: roles['bookstore'] || 0,
        admins: roles['admin'] || 0,
        total_bookstores: approvedBookstores[0].total,
        pending_bookstores: pendingBookstores[0].total,
        total_books: bookStats[0].total,
        available_books: availableBooks[0].total,
        total_transactions: transactionStats[0].total,
        pending_transactions: pendingTransactions[0].total,
        total_revenue: transactionStats[0].revenue || 0,
        total_commissions: totalEarnings,
        total_reviews: reviewStats[0].total
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get stats error:', error);
    return sendError(res, 500, 'Failed to retrieve statistics.');
  }
};

/**
 * Get admin activity logs
 * GET /api/admin/logs
 */
const getAdminLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();
    try {
      const [logs] = await connection.execute(
        `SELECT al.*, u.full_name as admin_name
         FROM admin_logs al
         JOIN users u ON al.admin_id = u.id
         ORDER BY al.created_at DESC
         LIMIT ? OFFSET ?`,
        [String(parseInt(limit)), String(offset)]
      );

      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM admin_logs'
      );

      return sendResponse(res, 200, true, 'Admin logs retrieved.', {
        logs,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        currentPage: parseInt(page)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get logs error:', error);
    return sendError(res, 500, 'Failed to retrieve logs.');
  }
};

// ============================================
// PAYMENT VERIFICATION
// ============================================

/**
 * Get all pending transactions for admin verification
 * GET /api/admin/transactions/pending
 */
const getPendingTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();
    try {
      const [transactions] = await connection.execute(
        `SELECT 
          t.id, t.status, t.amount, t.payment_method, t.transaction_reference,
          t.notes, t.created_at, t.completed_at,
          b.title as book_title, b.price as book_price,
          seller.id as seller_id, seller.full_name as seller_name, seller.email as seller_email,
          buyer.id as buyer_id, buyer.full_name as buyer_name, buyer.email as buyer_email
         FROM transactions t
         JOIN books b ON t.book_id = b.id
         JOIN users seller ON t.seller_id = seller.id
         JOIN users buyer ON t.buyer_id = buyer.id
         WHERE t.status = ?
         ORDER BY t.created_at DESC
         LIMIT ? OFFSET ?`,
        [status, String(parseInt(limit)), String(parseInt(offset))]
      );

      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM transactions WHERE status = ?',
        [status]
      );

      return sendResponse(res, 200, true, 'Transactions retrieved.', {
        transactions,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        currentPage: parseInt(page)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get pending transactions error:', error);
    return sendError(res, 500, 'Failed to retrieve pending transactions.');
  }
};

/**
 * Admin verify/reject a transaction
 * PUT /api/admin/transactions/:transactionId/verify
 */
const adminVerifyTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'
    const adminId = req.user.userId;

    if (!['approve', 'reject'].includes(action)) {
      return sendError(res, 400, 'Action must be approve or reject.');
    }

    const connection = await pool.getConnection();
    try {
      // Get transaction
      const [transactions] = await connection.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [transactionId]
      );

      if (transactions.length === 0) {
        return sendError(res, 404, 'Transaction not found.');
      }

      const txn = transactions[0];

      if (txn.status !== 'pending') {
        return sendError(res, 400, `Transaction is already ${txn.status}. Only pending transactions can be verified.`);
      }

      if (action === 'approve') {
        // Confirm payment — mark transaction completed, book sold
        await connection.execute(
          'UPDATE transactions SET status = ?, completed_at = NOW(), updated_at = NOW() WHERE id = ?',
          ['completed', transactionId]
        );
        await connection.execute(
          'UPDATE books SET status = ?, updated_at = NOW() WHERE id = ?',
          ['sold', txn.book_id]
        );

        await logAdminAction(connection, adminId, 'PAYMENT_APPROVED', 'transaction', transactionId,
          `Admin approved payment for transaction #${transactionId}`);

        // 💡 Broadcast updates
        emitAdminDataUpdate();
        emitTransactionUpdate(txn.buyer_id, { transactionId, status: 'completed' });
        emitBookStatusChange(txn.book_id, { status: 'sold' });

        return sendResponse(res, 200, true, 'Payment approved. Book marked as sold.');
      } else {
        // Reject — cancel transaction, restore book
        await connection.execute(
          'UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?',
          ['cancelled', transactionId]
        );
        await connection.execute(
          'UPDATE books SET status = ?, updated_at = NOW() WHERE id = ?',
          ['available', txn.book_id]
        );

        await logAdminAction(connection, adminId, 'PAYMENT_REJECTED', 'transaction', transactionId,
          `Admin rejected payment for transaction #${transactionId}. Reason: ${reason || 'Not specified'}`);

        // 💡 Broadcast updates
        emitAdminDataUpdate();
        emitTransactionUpdate(txn.buyer_id, { transactionId, status: 'cancelled' });
        emitBookStatusChange(txn.book_id, { status: 'available' });

        return sendResponse(res, 200, true, 'Payment rejected. Book is available again.');
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Admin verify transaction error:', error);
    return sendError(res, 500, 'Failed to verify transaction.');
  }
};


module.exports = {
  getAllUsers,
  verifyUser,
  suspendUser,
  activateUser,
  deleteUser,
  getBookstoreRequests,
  approveBookstore,
  rejectBookstore,
  getAllBooks,
  removeBook,
  getAllReviews,
  approveReview,
  rejectReview,
  getPlatformStats,
  getAdminLogs,
  getPendingTransactions,
  adminVerifyTransaction
};
