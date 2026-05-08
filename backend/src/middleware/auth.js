// Authentication Middleware

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/helpers');

/**
 * Verify JWT token and attached user info to request
 */
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'No token provided. Please login.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please login again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token. Please login again.');
    }
    return sendError(res, 401, 'Authentication failed.');
  }
};

/**
 * Check if user has required role
 * @param {string|array} requiredRoles
 */
const authorize = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'User not authenticated.');
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to access this resource.');
    }

    next();
  };
};

/**
 * Optional authentication - don't fail if not authenticated
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
