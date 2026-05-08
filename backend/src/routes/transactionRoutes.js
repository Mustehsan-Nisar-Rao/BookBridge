// Transaction Routes

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const constants = require('../config/constants');

/**
 * @route POST /api/transactions
 * @desc Create transaction (Buy/Donate book)
 * @access Private
 */
router.post('/', authenticate, [
  body('book_id').isInt().withMessage('Valid book ID is required'),
  body('transaction_type').isIn(['sale', 'donation', 'exchange']).withMessage('Invalid transaction type'),
  body('payment_method').optional().trim(),
  body('notes').optional().trim()
], transactionController.createTransaction);

/**
 * @route GET /api/transactions
 * @desc Get user transactions
 * @access Private
 */
router.get('/', authenticate, transactionController.getTransactions);

/**
 * @route GET /api/transactions/:transactionId
 * @desc Get transaction by ID
 * @access Private
 */
router.get('/:transactionId', authenticate, transactionController.getTransactionById);

/**
 * @route PUT /api/transactions/:transactionId
 * @desc Update transaction status
 * @access Private (Seller/Admin)
 */
router.put('/:transactionId', authenticate, [
  body('status').isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status')
], transactionController.updateTransaction);

/**
 * @route GET /api/transactions/stats/dashboard
 * @desc Get sales statistics
 * @access Private
 */
router.get('/stats/dashboard', authenticate, transactionController.getSalesStats);

module.exports = router;
