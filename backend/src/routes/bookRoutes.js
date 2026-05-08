// Book Routes

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif|webp/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedExtensions.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * @route POST /api/books
 * @desc Add new book
 * @access Private (Student/Bookstore)
 */
router.post('/', authenticate, upload.single('image'), [
  body('title').trim().notEmpty().withMessage('Book title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('book_type').isIn(['sale', 'donation']).withMessage('Book type must be sale or donation')
], bookController.addBook);

/**
 * @route GET /api/books
 * @desc Get all books with filters
 * @access Public
 */
router.get('/', bookController.getBooks);

router.get('/:bookId', optionalAuth, bookController.getBookById);

/**
 * @route PUT /api/books/:bookId
 * @desc Update book
 * @access Private (Owner/Admin)
 */
router.put('/:bookId', authenticate, [
  body('title').optional().trim(),
  body('author').optional().trim(),
  body('description').optional().trim(),
  body('status').optional().isIn(['available', 'sold', 'not_available'])
], bookController.updateBook);

/**
 * @route DELETE /api/books/:bookId
 * @desc Delete book
 * @access Private (Owner/Admin)
 */
router.delete('/:bookId', authenticate, bookController.deleteBook);

/**
 * @route GET /api/books/seller/:sellerId
 * @desc Get books by seller
 * @access Public
 */
router.get('/seller/:sellerId', bookController.getSellerBooks);

module.exports = router;
