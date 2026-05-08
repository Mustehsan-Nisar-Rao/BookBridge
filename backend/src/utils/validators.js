// Input Validation Utilities

const constants = require('../config/constants');

/**
 * Validate email is from educational domain
 * @param {string} email
 * @returns {boolean}
 */
const isEducationalEmail = (email) => {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return constants.ALLOWED_EDUCATIONAL_DOMAINS.some(allowed => domain?.endsWith(allowed));
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { isValid, errors }
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate price
 * @param {number} price
 * @returns {boolean}
 */
const isValidPrice = (price) => {
  return !isNaN(price) && price >= 0 && price <= 999999;
};

/**
 * Validate rating
 * @param {number} rating
 * @returns {boolean}
 */
const isValidRating = (rating) => {
  return !isNaN(rating) && rating >= constants.RATING_MIN && rating <= constants.RATING_MAX;
};

/**
 * Sanitize string input
 * @param {string} input
 * @returns {string}
 */
const sanitizeInput = (input) => {
  if (!input) return '';
  return input.trim();
};

/**
 * Validate user role
 * @param {string} role
 * @returns {boolean}
 */
const isValidRole = (role) => {
  return Object.values(constants.USER_ROLES).includes(role);
};

/**
 * Validate book condition
 * @param {string} condition
 * @returns {boolean}
 */
const isValidCondition = (condition) => {
  return Object.values(constants.BOOK_CONDITION).includes(condition);
};

module.exports = {
  isEducationalEmail,
  isValidEmail,
  validatePassword,
  isValidPrice,
  isValidRating,
  sanitizeInput,
  isValidRole,
  isValidCondition
};
