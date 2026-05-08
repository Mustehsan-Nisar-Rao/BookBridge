// Helper Functions

/**
 * Send standardized API response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success flag
 * @param {string} message - Response message
 * @param {any} data - Response data (optional)
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    statusCode
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {array} errors - Array of errors (optional)
 */
const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Generate random string
 * @param {number} length
 * @returns {string}
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to readable string
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate commission from sale amount
 * @param {number} amount
 * @param {number} rate
 * @returns {number}
 */
const calculateCommission = (amount, rate) => {
  return Math.round(amount * rate * 100) / 100;
};

/**
 * Check if file is allowed type
 * @param {string} filename
 * @returns {boolean}
 */
const isAllowedImageType = (filename) => {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const ext = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(ext);
};

/**
 * Generate JWT token payload
 * @param {number} userId
 * @param {string} role
 * @returns {object}
 */
const generateTokenPayload = (userId, role) => {
  return {
    userId,
    role,
    iat: Math.floor(Date.now() / 1000)
  };
};

/**
 * Extract domain from email
 * @param {string} email
 * @returns {string}
 */
const getEmailDomain = (email) => {
  return email.split('@')[1]?.toLowerCase() || '';
};

module.exports = {
  sendResponse,
  sendError,
  generateRandomString,
  formatDate,
  calculateCommission,
  isAllowedImageType,
  generateTokenPayload,
  getEmailDomain
};
