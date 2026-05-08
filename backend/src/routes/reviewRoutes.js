// Review Routes

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

/**
 * @route POST /api/reviews
 * @desc Create review for seller
 * @access Private (Authenticated users)
 */
router.post('/', authenticate, [
  body('seller_id').isInt().withMessage('Valid seller ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim(),
  body('comment').optional().trim()
], reviewController.createReview);

/**
 * @route GET /api/reviews/seller/:sellerId
 * @desc Get reviews for seller
 * @access Public
 */
router.get('/seller/:sellerId', reviewController.getSellerReviews);

/**
 * @route PUT /api/reviews/:reviewId
 * @desc Update review
 * @access Private (Owner/Admin)
 */
router.put('/:reviewId', authenticate, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().trim(),
  body('comment').optional().trim()
], reviewController.updateReview);

/**
 * @route DELETE /api/reviews/:reviewId
 * @desc Delete review
 * @access Private (Owner/Admin)
 */
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

module.exports = router;
