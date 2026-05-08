// Admin Routes

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const constants = require('../config/constants');

/**
 * Middleware: All admin routes require authentication + admin role
 */
router.use(authenticate, authorize(constants.USER_ROLES.ADMIN));

// ============================================
// USER MANAGEMENT
// ============================================

/** @route GET /api/admin/users - Get all users */
router.get('/users', adminController.getAllUsers);

/** @route PUT /api/admin/users/:userId/verify - Verify user */
router.put('/users/:userId/verify', adminController.verifyUser);

/** @route PUT /api/admin/users/:userId/suspend - Suspend user */
router.put('/users/:userId/suspend', adminController.suspendUser);

/** @route PUT /api/admin/users/:userId/activate - Activate (unsuspend) user */
router.put('/users/:userId/activate', adminController.activateUser);

/** @route DELETE /api/admin/users/:userId - Delete user permanently */
router.delete('/users/:userId', adminController.deleteUser);

// ============================================
// BOOKSTORE MANAGEMENT
// ============================================

/** @route GET /api/admin/bookstores - Get bookstore requests */
router.get('/bookstores', adminController.getBookstoreRequests);

/** @route PUT /api/admin/bookstores/:bookstoreId/approve - Approve bookstore */
router.put('/bookstores/:bookstoreId/approve', adminController.approveBookstore);

/** @route PUT /api/admin/bookstores/:bookstoreId/reject - Reject bookstore */
router.put('/bookstores/:bookstoreId/reject', adminController.rejectBookstore);

// ============================================
// BOOK/CONTENT MANAGEMENT
// ============================================

/** @route GET /api/admin/books - Get all books */
router.get('/books', adminController.getAllBooks);

/** @route DELETE /api/admin/books/:bookId - Remove book */
router.delete('/books/:bookId', [
  body('reason').optional().trim()
], adminController.removeBook);

// ============================================
// REVIEW MODERATION
// ============================================

/** @route GET /api/admin/reviews - Get all reviews */
router.get('/reviews', adminController.getAllReviews);

/** @route PUT /api/admin/reviews/:reviewId/approve - Approve review */
router.put('/reviews/:reviewId/approve', adminController.approveReview);

/** @route DELETE /api/admin/reviews/:reviewId - Reject (delete) review */
router.delete('/reviews/:reviewId', adminController.rejectReview);

// ============================================
// STATISTICS & LOGS
// ============================================

/** @route GET /api/admin/statistics - Get platform statistics */
router.get('/statistics', adminController.getPlatformStats);

/** @route GET /api/admin/logs - Get admin activity logs */
router.get('/logs', adminController.getAdminLogs);

// ── Payment Verification ──
router.get('/transactions/pending', adminController.getPendingTransactions);
router.put('/transactions/:transactionId/verify', adminController.adminVerifyTransaction);

module.exports = router;
