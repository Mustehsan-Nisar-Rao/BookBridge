import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash,
  FaExclamationTriangle, FaCheckCircle, FaPaperPlane
} from 'react-icons/fa';
import { authService } from '../services/api';
import logo from '../assets/logo.png';

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Forgot password
  const [email, setEmail] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSuccess, setFpSuccess] = useState('');
  const [fpError, setFpError] = useState('');

  // Reset password (when token present)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setFpError(''); setFpSuccess('');
    setFpLoading(true);
    try {
      await authService.forgotPassword(email);
      setFpSuccess('If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).');
    } catch (err) {
      setFpError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    if (newPassword !== confirmPassword) { setResetError('Passwords do not match.'); return; }
    setResetLoading(true);
    try {
      await authService.resetPassword({ token, newPassword, confirmPassword });
      setResetSuccess('Your password has been reset successfully! You can now sign in with your new password.');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setResetLoading(false);
    }
  };

  const Spinner = () => (
    <span className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
  );

  const iconStyle = {
    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
    color: '#9ca3af', fontSize: '0.95rem', zIndex: 1,
  };

  return (
    <div className="auth-page">
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '15%', left: '5%', width: '70px', height: '70px', background: 'rgba(197,160,40,0.12)', borderRadius: '50%', animation: 'float 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '6%', width: '90px', height: '90px', background: 'rgba(74,124,89,0.1)', borderRadius: '50%', animation: 'float 4s ease-in-out infinite reverse' }} />

      <div className="auth-card">

        {/* Header */}
        <div className="auth-header">
          <img src={logo} alt="BookBridge" style={{ height: '72px', width: 'auto', marginBottom: '8px', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '1.6rem', color: '#1a3c5e', marginBottom: '6px' }}>
            {token ? 'Set New Password' : 'Forgot Password?'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {token ? 'Enter your new password below' : "No worries! We'll send you reset instructions"}
          </p>
        </div>

        {/* ── RESET PASSWORD (token mode) ───── */}
        {token ? (
          <>
            {resetSuccess ? (
              <div>
                <div className="alert alert-success" style={{ marginBottom: '24px' }}>
                  <FaCheckCircle /> {resetSuccess}
                </div>
                <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                  Sign In Now <FaArrowRight style={{ fontSize: '0.85rem' }} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit}>
                {resetError && (
                  <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                    <FaExclamationTriangle /> {resetError}
                  </div>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <label className="label" htmlFor="new-password">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <FaLock style={iconStyle} />
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', paddingRight: '44px' }}
                      placeholder="Min 8 chars, uppercase, number, special"
                      required
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label className="label" htmlFor="confirm-new-password">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <FaLock style={iconStyle} />
                    <input
                      id="confirm-new-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', paddingRight: '44px' }}
                      placeholder="Repeat your new password"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>Passwords do not match</p>
                  )}
                </div>

                <button
                  id="reset-password-btn"
                  type="submit"
                  disabled={resetLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', marginBottom: '16px' }}
                >
                  {resetLoading
                    ? <><Spinner /> Resetting Password...</>
                    : <>Reset Password <FaArrowRight style={{ fontSize: '0.85rem' }} /></>
                  }
                </button>
              </form>
            )}
          </>
        ) : (
          /* ── FORGOT PASSWORD FORM ─────────── */
          <>
            {fpSuccess ? (
              <div>
                <div className="alert alert-success" style={{ marginBottom: '24px' }}>
                  <FaCheckCircle /> {fpSuccess}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ color: '#1a3c5e', fontWeight: 700, textDecoration: 'none' }}>
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                {fpError && (
                  <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                    <FaExclamationTriangle /> {fpError}
                  </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <label className="label" htmlFor="forgot-email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <FaEnvelope style={iconStyle} />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setFpError(''); }}
                      className="input-field"
                      style={{ paddingLeft: '42px' }}
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  id="send-reset-btn"
                  type="submit"
                  disabled={fpLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', marginBottom: '16px' }}
                >
                  {fpLoading
                    ? <><Spinner /> Sending Reset Link...</>
                    : <><FaPaperPlane style={{ fontSize: '0.85rem' }} /> Send Reset Link</>
                  }
                </button>

                <div style={{ textAlign: 'center' }}>
                  <Link
                    to="/login"
                    id="back-to-login"
                    style={{ color: '#1a3c5e', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}
                  >
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
