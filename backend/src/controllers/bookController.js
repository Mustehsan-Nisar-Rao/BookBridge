// Book Controller - PostgreSQL compatible

const { pool } = require('../config/database');
const { sendResponse, sendError } = require('../utils/helpers');
const { emitAdminDataUpdate, emitBookStatusChange } = require('../config/socket');
const { isValidPrice, isValidCondition, sanitizeInput } = require('../utils/validators');

/**
 * Add new book
 * POST /api/books
 */
const addBook = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const {
      title, author, subject, class_name, university, description,
      condition, price, book_type, isbn, quantity_available,
      accepted_payment_methods, jazzcash_number, easypaisa_number, bank_details
    } = req.body;

    if (!title || !author || !subject || !book_type) {
      return sendError(res, 400, 'Title, author, subject, and book type are required.');
    }
    if (book_type === 'sale' && (!price || !isValidPrice(price))) {
      return sendError(res, 400, 'Valid price is required for sale books.');
    }
    if (!isValidCondition(condition)) {
      return sendError(res, 400, 'Invalid book condition.');
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO books 
         (seller_id, title, author, subject, "class", university, description, 
          "condition", price, book_type, isbn, image_url, quantity_available, 
          accepted_payment_methods, jazzcash_number, easypaisa_number, bank_details, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING id`,
        [
          userId, sanitizeInput(title), sanitizeInput(author),
          sanitizeInput(subject), sanitizeInput(class_name),
          sanitizeInput(university), sanitizeInput(description),
          condition || 'good', price || 0, book_type,
          sanitizeInput(isbn), imageUrl, quantity_available || 1,
          accepted_payment_methods || 'cod',
          sanitizeInput(jazzcash_number) || null,
          sanitizeInput(easypaisa_number) || null,
          sanitizeInput(bank_details) || null, 'available'
        ]
      );
      emitAdminDataUpdate();
      return sendResponse(res, 201, true, 'Book added successfully.', { bookId: result[0]?.id });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Add book error:', error);
    return sendError(res, 500, 'Failed to add book.');
  }
};

/**
 * Get all books with filters
 * GET /api/books
 */
const getBooks = async (req, res) => {
  try {
    const { subject, class_name, university, minPrice, maxPrice, status, book_type, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let paramIdx = 1;
    let where = "WHERE 1=1";

    if (subject) { where += ` AND subject = $${paramIdx++}`; params.push(sanitizeInput(subject)); }
    if (class_name) { where += ` AND "class" = $${paramIdx++}`; params.push(sanitizeInput(class_name)); }
    if (university) { where += ` AND university = $${paramIdx++}`; params.push(sanitizeInput(university)); }
    if (minPrice) { where += ` AND price >= $${paramIdx++}`; params.push(parseFloat(minPrice)); }
    if (maxPrice) { where += ` AND price <= $${paramIdx++}`; params.push(parseFloat(maxPrice)); }
    if (book_type) { where += ` AND book_type = $${paramIdx++}`; params.push(book_type); }
    if (status) { where += ` AND status = $${paramIdx++}`; params.push(status); }
    else { where += ` AND status = 'available'`; }

    const query = `SELECT *, "class" AS class_name FROM books ${where} ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(parseInt(limit), offset);

    const countParams = params.slice(0, -2);
    const countQuery = `SELECT COUNT(*) as total FROM books ${where}`;

    const connection = await pool.getConnection();
    try {
      const [books] = await connection.execute(query, params);
      const [countResult] = await connection.execute(countQuery, countParams);
      const total = parseInt(countResult[0]?.total || 0);
      return sendResponse(res, 200, true, 'Books retrieved.', {
        books, total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get books error:', error);
    return sendError(res, 500, 'Failed to retrieve books.');
  }
};

/**
 * Get book by ID
 * GET /api/books/:bookId
 */
const getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    const connection = await pool.getConnection();
    try {
      const [books] = await connection.execute(
        `SELECT b.*, b."class" AS class_name, u.full_name as seller_name, u.email as seller_email,
                u.profile_image as seller_image, bs.store_name, bs.average_rating
         FROM books b
         JOIN users u ON b.seller_id = u.id
         LEFT JOIN bookstores bs ON u.id = bs.user_id
         WHERE b.id = $1`,
        [bookId]
      );
      if (books.length === 0) return sendError(res, 404, 'Book not found.');

      const book = books[0];
      const [reviews] = await connection.execute(
        'SELECT rating, comment, reviewer_id, created_at FROM reviews WHERE seller_id = $1',
        [book.seller_id]
      );

      await connection.execute(
        'UPDATE books SET views_count = views_count + 1 WHERE id = $1', [bookId]
      );

      let user_pending_transaction = false;
      if (req.user) {
        const [pending] = await connection.execute(
          "SELECT id FROM transactions WHERE book_id = $1 AND buyer_id = $2 AND status = 'pending'",
          [bookId, req.user.userId]
        );
        user_pending_transaction = pending.length > 0;
      }

      return sendResponse(res, 200, true, 'Book retrieved.', {
        ...book, seller_reviews: reviews, user_pending_transaction
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get book error:', error);
    return sendError(res, 500, 'Failed to retrieve book.');
  }
};

/**
 * Update book
 * PUT /api/books/:bookId
 */
const updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.user;
    const { title, author, description, condition, price, status, quantity_available, accepted_payment_methods } = req.body;

    const connection = await pool.getConnection();
    try {
      const [books] = await connection.execute(
        'SELECT seller_id FROM books WHERE id = $1', [bookId]
      );
      if (books.length === 0) return sendError(res, 404, 'Book not found.');
      if (books[0].seller_id !== userId && req.user.role !== 'admin') {
        return sendError(res, 403, 'You do not have permission to update this book.');
      }

      await connection.execute(
        `UPDATE books 
         SET title = COALESCE($1, title),
             author = COALESCE($2, author),
             description = COALESCE($3, description),
             "condition" = COALESCE($4, "condition"),
             price = COALESCE($5, price),
             status = COALESCE($6, status),
             quantity_available = COALESCE($7, quantity_available),
             accepted_payment_methods = COALESCE($8, accepted_payment_methods),
             updated_at = NOW()
         WHERE id = $9`,
        [
          sanitizeInput(title), sanitizeInput(author), sanitizeInput(description),
          condition, price, status, quantity_available, accepted_payment_methods, bookId
        ]
      );

      emitAdminDataUpdate();
      emitBookStatusChange(bookId, { status: status || 'updated' });
      return sendResponse(res, 200, true, 'Book updated successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update book error:', error);
    return sendError(res, 500, 'Failed to update book.');
  }
};

/**
 * Delete book
 * DELETE /api/books/:bookId
 */
const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.user;
    const connection = await pool.getConnection();
    try {
      const [books] = await connection.execute(
        'SELECT seller_id FROM books WHERE id = $1', [bookId]
      );
      if (books.length === 0) return sendError(res, 404, 'Book not found.');
      if (books[0].seller_id !== userId && req.user.role !== 'admin') {
        return sendError(res, 403, 'You do not have permission to delete this book.');
      }

      await connection.execute('DELETE FROM books WHERE id = $1', [bookId]);
      emitAdminDataUpdate();
      emitBookStatusChange(bookId, { status: 'deleted' });
      return sendResponse(res, 200, true, 'Book deleted successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete book error:', error);
    return sendError(res, 500, 'Failed to delete book.');
  }
};

/**
 * Get seller books
 * GET /api/books/seller/:sellerId
 */
const getSellerBooks = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const connection = await pool.getConnection();
    try {
      const [books] = await connection.execute(
        `SELECT *, "class" AS class_name FROM books 
         WHERE seller_id = $1 AND status = 'available'
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [sellerId, parseInt(limit), offset]
      );
      const [countResult] = await connection.execute(
        "SELECT COUNT(*) as total FROM books WHERE seller_id = $1 AND status = 'available'",
        [sellerId]
      );
      const total = parseInt(countResult[0]?.total || 0);
      return sendResponse(res, 200, true, 'Seller books retrieved.', {
        books, total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get seller books error:', error);
    return sendError(res, 500, 'Failed to retrieve seller books.');
  }
};

module.exports = { addBook, getBooks, getBookById, updateBook, deleteBook, getSellerBooks };
