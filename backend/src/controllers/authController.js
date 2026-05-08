// Authentication Controller

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { pool } = require('../config/database');
const { sendResponse, sendError } = require('../utils/helpers');
const {
  isEducationalEmail,
  isValidEmail,
  validatePassword,
  sanitizeInput
} = require('../utils/validators');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      full_name,
      email,
      password,
      confirmPassword,
      role,
      university,
      store_name,
      registration_number,
      store_description,
      payment_method,
      payment_reference,
      payment_notes,
      jazzcash_number,
      easypaisa_number,
      bank_details
    } = req.body;

    // Validation
    if (!full_name || !email || !password || !confirmPassword) {
      return sendError(res, 400, 'All fields are required.');
    }

    if (!isValidEmail(email)) {
      return sendError(res, 400, 'Invalid email format.');
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match.');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return sendError(res, 400, 'Password is weak.', passwordValidation.errors);
    }

    const userRole = (role || 'student').toLowerCase();
    const allowedRoles = ['student', 'bookstore', 'admin'];
    if (!allowedRoles.includes(userRole)) {
      return sendError(res, 403, 'Invalid role selected.');
    }

    if (userRole === 'admin' && !jazzcash_number && !easypaisa_number && !bank_details) {
      return sendError(res, 400, 'Admin must provide at least one payment method.');
    }

    if (userRole === 'bookstore') {
      if (!store_name) return sendError(res, 400, 'Store name is required.');
      if (!payment_method) return sendError(res, 400, 'Payment method is required.');
      if (!payment_reference) return sendError(res, 400, 'Payment reference (TID) is required.');
    }

    // Start Transaction
    await connection.beginTransaction();

    try {
      // Check if email exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.length > 0) {
        await connection.rollback();
        return sendError(res, 409, 'Email already registered. Please login instead.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const isActive = userRole === 'bookstore' ? false : true;

      // 1. Insert User
      const [userResult] = await connection.execute(
        `INSERT INTO users 
         (full_name, name, email, password, password_hash, role, university, is_active, jazzcash_number, easypaisa_number, bank_details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          sanitizeInput(full_name),
          sanitizeInput(full_name), // Satisfy the NOT NULL constraint on the 'name' column
          email.toLowerCase(),
          hashedPassword,
          hashedPassword, // Satisfy the NOT NULL constraint on the 'password_hash' column
          userRole,
          sanitizeInput(university) || null,
          isActive,
          sanitizeInput(jazzcash_number) || null,
          sanitizeInput(easypaisa_number) || null,
          sanitizeInput(bank_details) || null
        ]
      );

      const userId = userResult[0]?.id;

      // 2. Insert Bookstore if applicable
      if (userRole === 'bookstore') {
        try {
          await connection.execute(
            `INSERT INTO bookstores 
             (user_id, store_name, store_description, registration_number, subscription_amount, payment_method, payment_reference, payment_notes, payment_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
            [
              userId,
              sanitizeInput(store_name),
              sanitizeInput(store_description) || null,
              sanitizeInput(registration_number) || null,
              4000.00,
              payment_method,
              sanitizeInput(payment_reference),
              sanitizeInput(payment_notes) || null
            ]
          );
        } catch (dbErr) {
          // Check for unique constraint violation on registration_number
          if (dbErr.code === '23505') {
            await connection.rollback();
            return sendError(res, 409, 'This registration number is already in use by another bookstore.');
          }
          throw dbErr;
        }
      }

      // Generate token
      const token = jwt.sign(
        { userId, role: userRole },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      await connection.commit();

      return sendResponse(res, 201, true, 'Registration successful.', {
        userId,
        token,
        email: email.toLowerCase(),
        role: userRole,
        full_name,
        is_active: isActive
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 500, 'Registration failed. ' + (error.message || 'Please try again.'));
  } finally {
    connection.release();
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    if (!isValidEmail(email)) {
      return sendError(res, 400, 'Invalid email format.');
    }

    const connection = await pool.getConnection();
    try {
      // Get user
      const [users] = await connection.execute(
        'SELECT id, password, role, full_name, email, phone, city, address, bio, university, is_active FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (users.length === 0) {
        return sendError(res, 401, 'Invalid credentials. User not found.');
      }

      const user = users[0];

      // Block suspended non-bookstore users
      if (!user.is_active && user.role !== 'bookstore') {
        return sendError(res, 401, 'Your account is currently inactive or suspended. Please contact admin.');
      }

      // Special check for bookstores: if rejected/inactive but still accessible for status
      // We check if it's a bookstore and still inactive (pending)
      const isPending = user.role === 'bookstore' && !user.is_active;

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 401, 'Invalid credentials. Wrong password.');
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: user.role, isPending },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return sendResponse(res, 200, true, isPending ? 'Login successful. Application pending.' : 'Login successful.', {
        userId: user.id,
        token,
        email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        city: user.city,
        address: user.address,
        bio: user.bio,
        university: user.university,
        is_active: user.is_active,
        is_pending: isPending
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Login failed. Please try again.');
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        `SELECT id, full_name, email, role, university, city, address, 
                phone, profile_image, bio, is_verified, created_at,
                jazzcash_number, easypaisa_number, bank_details
         FROM users WHERE id = $1`,
        [userId]
      );

      if (users.length === 0) {
        return sendError(res, 404, 'User not found.');
      }

      const user = users[0];

      // If bookstore, get bookstore info
      if (user.role === 'bookstore') {
        const [bookstoreData] = await connection.execute(
          `SELECT id, store_name, store_description, registration_number, is_approved, is_premium, subscription_amount, payment_method, payment_reference, payment_status, subscription_start_date, subscription_end_date, average_rating, total_sales
           FROM bookstores WHERE user_id = $1`,
          [userId]
        );
        if (bookstoreData.length > 0) {
          user.bookstore = bookstoreData[0];
        }
      }

      return sendResponse(res, 200, true, 'User profile retrieved.', user);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get user error:', error);
    return sendError(res, 500, 'Failed to retrieve user profile.');
  }
};

/**
 * Get admin payment method info
 * GET /api/auth/admin-payment-info
 */
const getAdminPaymentInfo = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [admins] = await connection.execute(
        `SELECT id, full_name, email, jazzcash_number, easypaisa_number, bank_details
         FROM users
         WHERE role = 'admin' AND is_active = TRUE
           AND (jazzcash_number IS NOT NULL OR easypaisa_number IS NOT NULL OR bank_details IS NOT NULL)
         ORDER BY created_at DESC
         LIMIT 1`
      );
      // pg returns array of rows

      if (admins.length === 0) {
        return sendError(res, 404, 'Admin payment information is not yet available.');
      }

      return sendResponse(res, 200, true, 'Admin payment info retrieved.', admins[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get admin payment info error:', error);
    return sendError(res, 500, 'Failed to retrieve admin payment information.');
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { full_name, phone, city, address, bio, jazzcash_number, easypaisa_number, bank_details } = req.body;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `UPDATE users 
         SET full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             city = COALESCE($3, city),
             address = COALESCE($4, address),
             bio = COALESCE($5, bio),
             jazzcash_number = COALESCE($6, jazzcash_number),
             easypaisa_number = COALESCE($7, easypaisa_number),
             bank_details = COALESCE($8, bank_details),
             updated_at = NOW()
         WHERE id = $9`,
        [
          sanitizeInput(full_name),
          phone,
          sanitizeInput(city),
          sanitizeInput(address),
          sanitizeInput(bio),
          sanitizeInput(jazzcash_number) || null,
          sanitizeInput(easypaisa_number) || null,
          sanitizeInput(bank_details) || null,
          userId
        ]
      );

      // pg doesn't have affectedRows, check rowCount via re-query if needed

      return sendResponse(res, 200, true, 'Profile updated successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 500, 'Failed to update profile.');
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, 400, 'All password fields are required.');
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 400, 'New passwords do not match.');
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return sendError(res, 400, 'New password is weak.', passwordValidation.errors);
    }

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      if (users.length === 0) {
        return sendError(res, 404, 'User not found.');
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
      if (!isPasswordValid) {
        return sendError(res, 401, 'Current password is incorrect.');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await connection.execute(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, userId]
      );

      return sendResponse(res, 200, true, 'Password changed successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Change password error:', error);
    return sendError(res, 500, 'Failed to change password.');
  }
};

/**
 * Forgot Password - Send reset email
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return sendError(res, 400, 'Valid email is required.');
    }

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT id, full_name FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      // Always return success to prevent email enumeration
      if (users.length === 0) {
        return sendResponse(res, 200, true, 'If an account with that email exists, a reset link has been sent.');
      }

      const user = users[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token in DB
      await connection.execute(
        'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
        [resetToken, resetExpiry, user.id]
      );

      // Send email (if configured)
      try {
        const transporter = nodemailer.createTransporter({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
        await transporter.sendMail({
          from: `"BookBridge" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'BookBridge - Password Reset Request',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#1a3c5e">Password Reset Request</h2>
              <p>Hello ${user.full_name},</p>
              <p>You requested a password reset for your BookBridge account.</p>
              <a href="${resetUrl}" style="background:#1a3c5e;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">Reset Password</a>
              <p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>
              <p>— The BookBridge Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email send error (non-fatal):', emailError.message);
      }

      return sendResponse(res, 200, true, 'If an account with that email exists, a reset link has been sent.', { resetToken });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return sendError(res, 500, 'Failed to process request.');
  }
};

/**
 * Reset Password with token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
      return sendError(res, 400, 'All fields are required.');
    }
    if (newPassword !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match.');
    }
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return sendError(res, 400, 'Password is weak.', passwordValidation.errors);
    }

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [token]
      );
      if (users.length === 0) {
        return sendError(res, 400, 'Invalid or expired reset token.');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await connection.execute(
        'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW() WHERE id = $2',
        [hashedPassword, users[0].id]
      );
      return sendResponse(res, 200, true, 'Password reset successfully. Please login.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return sendError(res, 500, 'Failed to reset password.');
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getAdminPaymentInfo,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
