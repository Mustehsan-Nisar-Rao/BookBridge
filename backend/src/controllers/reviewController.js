// Review Controller

const { pool } = require('../config/database');
const { sendResponse, sendError } = require('../utils/helpers');
const { isValidRating, sanitizeInput } = require('../utils/validators');

/**
 * Create review for seller
 * POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { seller_id, transaction_id, rating, title, comment } = req.body;

    // Validation
    if (!seller_id || !rating) {
      return sendError(res, 400, 'Seller ID and rating are required.');
    }

    if (!isValidRating(rating)) {
      return sendError(res, 400, 'Rating must be between 1 and 5.');
    }

    // Prevent self-review
    if (parseInt(seller_id) === userId) {
      return sendError(res, 400, 'You cannot review yourself.');
    }

    const connection = await pool.getConnection();
    try {
      // Check if seller exists
      const [sellers] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [seller_id]
      );

      if (sellers.length === 0) {
        return sendError(res, 404, 'Seller not found.');
      }

      // Check if user already reviewed this seller
      const [existingReview] = await connection.execute(
        'SELECT id FROM reviews WHERE seller_id = ? AND reviewer_id = ?',
        [seller_id, userId]
      );

      if (existingReview.length > 0) {
        return sendError(res, 409, 'You have already reviewed this seller.');
      }

      // Insert review
      const [result] = await connection.execute(
        `INSERT INTO reviews 
         (seller_id, reviewer_id, transaction_id, rating, title, comment)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          seller_id,
          userId,
          transaction_id || null,
          rating,
          sanitizeInput(title),
          sanitizeInput(comment)
        ]
      );

      // Update seller's average rating
      await updateSellerRating(connection, seller_id);

      return sendResponse(res, 201, true, 'Review created successfully.', {
        reviewId: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create review error:', error);
    return sendError(res, 500, 'Failed to create review.');
  }
};

/**
 * Get seller reviews
 * GET /api/reviews/seller/:sellerId
 */
const getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();
    try {
      // Check if seller exists
      const [sellers] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [sellerId]
      );

      if (sellers.length === 0) {
        return sendError(res, 404, 'Seller not found.');
      }

      // Get reviews
      const [reviews] = await connection.execute(
        `SELECT r.*, u.full_name as reviewer_name, u.profile_image as reviewer_image
         FROM reviews r
         JOIN users u ON r.reviewer_id = u.id
         WHERE r.seller_id = ? AND r.is_approved = TRUE
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
        [sellerId, String(parseInt(limit)), String(parseInt(offset))]
      );

      // Get count
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM reviews 
         WHERE seller_id = ? AND is_approved = TRUE`,
        [sellerId]
      );

      // Get seller rating
      const [sellerData] = await connection.execute(
        'SELECT average_rating FROM bookstores WHERE user_id = ?',
        [sellerId]
      );

      const averageRating = sellerData.length > 0 ? sellerData[0].average_rating : 0;

      return sendResponse(res, 200, true, 'Reviews retrieved.', {
        reviews,
        averageRating,
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
 * Update review
 * PUT /api/reviews/:reviewId
 */
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.user;
    const { rating, title, comment } = req.body;

    if (rating && !isValidRating(rating)) {
      return sendError(res, 400, 'Rating must be between 1 and 5.');
    }

    const connection = await pool.getConnection();
    try {
      // Check ownership
      const [reviews] = await connection.execute(
        'SELECT reviewer_id, seller_id FROM reviews WHERE id = ?',
        [reviewId]
      );

      if (reviews.length === 0) {
        return sendError(res, 404, 'Review not found.');
      }

      if (reviews[0].reviewer_id !== userId && req.user.role !== 'admin') {
        return sendError(res, 403, 'You do not have permission to update this review.');
      }

      const [result] = await connection.execute(
        `UPDATE reviews 
         SET rating = COALESCE(?, rating),
             title = COALESCE(?, title),
             comment = COALESCE(?, comment),
             updated_at = NOW()
         WHERE id = ?`,
        [rating, sanitizeInput(title), sanitizeInput(comment), reviewId]
      );

      if (result.affectedRows === 0) {
        return sendError(res, 400, 'Failed to update review.');
      }

      // Update seller's average rating
      await updateSellerRating(connection, reviews[0].seller_id);

      return sendResponse(res, 200, true, 'Review updated successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update review error:', error);
    return sendError(res, 500, 'Failed to update review.');
  }
};

/**
 * Delete review
 * DELETE /api/reviews/:reviewId
 */
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.user;

    const connection = await pool.getConnection();
    try {
      // Check ownership
      const [reviews] = await connection.execute(
        'SELECT reviewer_id, seller_id FROM reviews WHERE id = ?',
        [reviewId]
      );

      if (reviews.length === 0) {
        return sendError(res, 404, 'Review not found.');
      }

      if (reviews[0].reviewer_id !== userId && req.user.role !== 'admin') {
        return sendError(res, 403, 'You do not have permission to delete this review.');
      }

      const [result] = await connection.execute(
        'DELETE FROM reviews WHERE id = ?',
        [reviewId]
      );

      if (result.affectedRows === 0) {
        return sendError(res, 400, 'Failed to delete review.');
      }

      // Update seller's average rating
      await updateSellerRating(connection, reviews[0].seller_id);

      return sendResponse(res, 200, true, 'Review deleted successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete review error:', error);
    return sendError(res, 500, 'Failed to delete review.');
  }
};

/**
 * Helper function to update seller's average rating
 */
const updateSellerRating = async (connection, sellerId) => {
  try {
    const [ratingData] = await connection.execute(
      'SELECT AVG(rating) as average_rating FROM reviews WHERE seller_id = ?',
      [sellerId]
    );

    const averageRating = ratingData[0].average_rating || 0;

    await connection.execute(
      'UPDATE bookstores SET average_rating = ? WHERE user_id = ?',
      [Math.round(averageRating * 10) / 10, sellerId]
    );
  } catch (error) {
    console.error('Update seller rating error:', error);
  }
};

module.exports = {
  createReview,
  getSellerReviews,
  updateReview,
  deleteReview
};
