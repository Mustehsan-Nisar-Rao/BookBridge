// Error Handling Middleware

const { sendError } = require('../utils/helpers');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 413, 'File size exceeds maximum limit of 5MB.');
  }

  if (err.code === 'LIMIT_PART_COUNT') {
    return sendError(res, 400, 'Too many file parts.');
  }

  // Validation errors
  if (err.status === 400 && err.array) {
    const errors = err.array().map(e => ({
      field: e.param,
      message: e.msg
    }));
    return sendError(res, 400, 'Validation failed.', errors);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return sendError(res, statusCode, message);
};

/**
 * 404 Handler
 */
const notFound = (req, res, next) => {
  sendError(res, 404, `Route not found: ${req.originalUrl}`);
};

module.exports = { errorHandler, notFound };
