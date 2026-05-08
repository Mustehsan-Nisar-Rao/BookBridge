// Transaction Controller

const { pool } = require('../config/database');
const { sendResponse, sendError, calculateCommission } = require('../utils/helpers');
const { emitTransactionUpdate, emitAdminDataUpdate, emitBookStatusChange } = require('../config/socket');
const constants = require('../config/constants');

/**
 * Create transaction (Buy or Donate book)
 * POST /api/transactions
 */
const createTransaction = async (req, res) => {
  try {
    const { userId } = req.user;
    const { book_id, transaction_type, payment_method, notes, transaction_reference } = req.body;

    // Validation
    if (!book_id || !transaction_type) {
      return sendError(res, 400, 'Book ID and transaction type are required.');
    }

    if (!['sale', 'donation', 'exchange'].includes(transaction_type)) {
      return sendError(res, 400, 'Invalid transaction type.');
    }

    const connection = await pool.getConnection();
    try {
      // Get book details
      const [books] = await connection.execute(
        'SELECT * FROM books WHERE id = ?',
        [book_id]
      );

      if (books.length === 0) {
        return sendError(res, 404, 'Book not found.');
      }

      const book = books[0];

      // Prevent buying own book
      if (book.seller_id === userId) {
        return sendError(res, 400, 'You cannot buy your own book.');
      }

      // Check availability
      if (book.status !== 'available') {
        return sendError(res, 400, 'Book is not available for purchase.');
      }

      let amount = 0;
      let commission = 0;

      if (transaction_type === 'sale') {
        amount = book.price;
        commission = calculateCommission(amount, constants.COMMISSION_PERCENTAGE);
      }

      // Create transaction
      const [result] = await connection.execute(
        `INSERT INTO transactions 
         (book_id, seller_id, buyer_id, transaction_type, status, amount, commission, payment_method, notes, transaction_reference)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          book_id,
          book.seller_id,
          userId,
          transaction_type,
          'pending',
          amount,
          commission,
          payment_method,
          notes,
          transaction_reference || null
        ]
      );

      // 💡 Broadcast update to Admin (new pending txn)
      emitAdminDataUpdate();
      // 💡 Broadcast update to Seller (new order incoming)
      emitTransactionUpdate(book.seller_id, { book_id, transactionId: result.insertId, type: 'new_order' });

      return sendResponse(res, 201, true, 'Order created successfully! Please wait for Admin to verify your payment reference.', {
        transactionId: result.insertId,
        amount,
        commission
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create transaction error:', error);
    return sendError(res, 500, 'Failed to create transaction.');
  }
};

/**
 * Get user transactions
 * GET /api/transactions
 */
const getTransactions = async (req, res) => {
  try {
    const { userId } = req.user;
    const { type = 'all', status, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT t.*, b.title as book_title, b.image_url, 
               u.full_name as seller_name, u.profile_image
        FROM transactions t
        JOIN books b ON t.book_id = b.id
        JOIN users u ON t.seller_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (type === 'sold') {
        query += ' AND t.seller_id = ?';
        params.push(userId);
      } else if (type === 'bought') {
        query += ' AND t.buyer_id = ?';
        params.push(userId);
      } else {
        query += ' AND (t.seller_id = ? OR t.buyer_id = ?)';
        params.push(userId, userId);
      }

      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }

      query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
      params.push(String(parseInt(limit)), String(offset));

      const [transactions] = await connection.execute(query, params);

      // Get count
      let countQuery = `
        SELECT COUNT(*) as total FROM transactions t
        WHERE 1=1
      `;
      const countParams = [];

      if (type === 'sold') {
        countQuery += ' AND t.seller_id = ?';
        countParams.push(userId);
      } else if (type === 'bought') {
        countQuery += ' AND t.buyer_id = ?';
        countParams.push(userId);
      } else {
        countQuery += ' AND (t.seller_id = ? OR t.buyer_id = ?)';
        countParams.push(userId, userId);
      }

      if (status) {
        countQuery += ' AND t.status = ?';
        countParams.push(status);
      }

      const [countResult] = await connection.execute(countQuery, countParams);
      const total = countResult[0].total;

      return sendResponse(res, 200, true, 'Transactions retrieved.', {
        transactions,
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get transactions error:', error);
    return sendError(res, 500, 'Failed to retrieve transactions.');
  }
};

/**
 * Get transaction by ID
 * GET /api/transactions/:transactionId
 */
const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { userId } = req.user;

    const connection = await pool.getConnection();
    try {
      const [transactions] = await connection.execute(
        `SELECT t.*, b.title, b.isbn, u.full_name as seller_name, u.email as seller_email,
                u.phone, u.address
         FROM transactions t
         JOIN books b ON t.book_id = b.id
         JOIN users u ON t.seller_id = u.id
         WHERE t.id = ?`,
        [transactionId]
      );

      if (transactions.length === 0) {
        return sendError(res, 404, 'Transaction not found.');
      }

      const transaction = transactions[0];

      // Check access
      if (transaction.seller_id !== userId && transaction.buyer_id !== userId && req.user.role !== 'admin') {
        return sendError(res, 403, 'You do not have permission to view this transaction.');
      }

      return sendResponse(res, 200, true, 'Transaction retrieved.', transaction);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get transaction error:', error);
    return sendError(res, 500, 'Failed to retrieve transaction.');
  }
};

/**
 * Update transaction status
 * PUT /api/transactions/:transactionId
 */
const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { userId } = req.user;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return sendError(res, 400, 'Invalid status.');
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

      const transaction = transactions[0];

      // Check access (only seller or admin can update)
      if (transaction.seller_id !== userId && req.user.role !== 'admin') {
        return sendError(res, 403, 'You do not have permission to update this transaction.');
      }

      // 💡 NEW RULE: ONLY admin can mark as 'completed' (Verify payment)
      if (status === 'completed' && req.user.role !== 'admin') {
        return sendError(res, 403, 'Only administrators can verify and complete payments.');
      }

      // 💡 NEW RULE: If a TID/Reference is submitted, ONLY admin can 'cancel' (Reject payment)
      // This prevents the seller from unilaterally rejecting a buyer who claims to have paid.
      if (status === 'cancelled' && transaction.transaction_reference && req.user.role !== 'admin') {
        return sendError(res, 403, 'Payment proof submitted. Only administrators can reject or cancel this transaction.');
      }

      let completedAt = null;
      if (status === 'completed') {
        completedAt = new Date();
      }

      await connection.execute(
        `UPDATE transactions 
         SET status = ?, completed_at = ?, updated_at = NOW()
         WHERE id = ?`,
        [status, completedAt, transactionId]
      );

      // If confirmed (completed) → mark book as sold
      if (status === 'completed') {
        await connection.execute(
          'UPDATE books SET status = ?, updated_at = NOW() WHERE id = ?',
          ['sold', transaction.book_id]
        );
      }

      // If cancelled → restore book to available
      if (status === 'cancelled') {
        await connection.execute(
          'UPDATE books SET status = ?, updated_at = NOW() WHERE id = ?',
          ['available', transaction.book_id]
        );
      }

      const message = status === 'completed'
        ? 'Payment confirmed! Book marked as sold.'
        : status === 'cancelled'
        ? 'Order rejected. Book is available again.'
        : 'Transaction updated successfully.';

      // 💡 Broadcast updates
      emitAdminDataUpdate();
      emitTransactionUpdate(transaction.buyer_id, { transactionId, status });
      emitTransactionUpdate(transaction.seller_id, { transactionId, status });
      emitBookStatusChange(transaction.book_id, { status: status === 'completed' ? 'sold' : 'available' });

      return sendResponse(res, 200, true, message);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update transaction error:', error);
    return sendError(res, 500, 'Failed to update transaction.');
  }
};

/**
 * Get sales statistics for seller
 * GET /api/transactions/stats/dashboard
 */
const getSalesStats = async (req, res) => {
  try {
    const { userId } = req.user;

    const connection = await pool.getConnection();
    try {
      // Total sales count
      const [salesCount] = await connection.execute(
        'SELECT COUNT(*) as total FROM transactions WHERE seller_id = ? AND status = \'completed\'',
        [userId]
      );

      // Total revenue
      const [revenue] = await connection.execute(
        'SELECT SUM(amount) as total FROM transactions WHERE seller_id = ? AND status = \'completed\' AND transaction_type = \'sale\'',
        [userId]
      );

      // Average rating
      const [rating] = await connection.execute(
        'SELECT AVG(rating) as average FROM reviews WHERE seller_id = ?',
        [userId]
      );

      // Books count
      const [booksCount] = await connection.execute(
        'SELECT COUNT(*) as total FROM books WHERE seller_id = ? AND status = "available"',
        [userId]
      );

      return sendResponse(res, 200, true, 'Sales statistics retrieved.', {
        total_sales: salesCount[0].total,
        total_revenue: revenue[0].total || 0,
        average_rating: rating[0].average || 0,
        active_listings: booksCount[0].total
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get stats error:', error);
    return sendError(res, 500, 'Failed to retrieve statistics.');
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  getSalesStats
};
