import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMessage, setFpMessage] = useState('');
  const [fpError, setFpError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      if (response.data?.is_pending) {
        navigate('/pending-verification');
      } else if (response.data?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!fpEmail) { setFpError('Please enter your email address.'); return; }
    setFpLoading(true);
    setFpError('');
    setFpMessage('');
    try {
      await authService.forgotPassword(fpEmail);
      setFpMessage('If an account with that email exists, a reset link has been sent. Please check your inbox.');
    } catch {
      setFpError('Failed to send reset link. Please try again.');
    } finally {
      setFpLoading(false);
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
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '70px', height: '70px', background: 'rgba(197,160,40,0.12)', borderRadius: '50%', animation: 'float 4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '7%', width: '90px', height: '90px', background: 'rgba(74,124,89,0.1)', borderRadius: '50%', animation: 'float 5s ease-in-out infinite reverse' }} />

      <div className="auth-card">

        {/* Header with real logo */}
        <div className="auth-header">
          <img src={logo} alt="BookBridge" style={{ height: '72px', width: 'auto', marginBottom: '8px', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '1.6rem', color: '#1a3c5e', marginBottom: '6px' }}>
            {showForgotPassword ? 'Reset Password' : 'Welcome Back!'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {showForgotPassword
              ? "Enter your email to receive a reset link"
              : "Sign in to your BookBridge account"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* ── FORGOT PASSWORD FORM ─────────────── */}
        {showForgotPassword ? (
          <>
            {fpMessage && (
              <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                <FaCheckCircle /> {fpMessage}
              </div>
            )}
            {fpError && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                <FaExclamationTriangle /> {fpError}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: '20px' }}>
                <label className="label" htmlFor="fp-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={iconStyle} />
                  <input
                    id="fp-email"
                    type="email"
                    value={fpEmail}
                    onChange={(e) => { setFpEmail(e.target.value); setFpError(''); }}
                    className="input-field"
                    style={{ paddingLeft: '42px' }}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <button
                id="fp-submit-btn"
                type="submit"
                disabled={fpLoading}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '16px', padding: '14px' }}
              >
                {fpLoading
                  ? <><Spinner /> Sending Reset Link...</>
                  : <><FaPaperPlane style={{ fontSize: '0.85rem' }} /> Send Reset Link</>
                }
              </button>
            </form>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => { setShowForgotPassword(false); setFpMessage(''); setFpError(''); setFpEmail(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a3c5e', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'underline' }}
              >
                Back to Sign In
              </button>
            </div>
          </>
        ) : (
          /* ── LOGIN FORM ──────────────────────── */
          <>
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: '18px' }}>
                <label className="label" htmlFor="login-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={iconStyle} />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    style={{ paddingLeft: '42px' }}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => setShowForgotPassword(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a7c59', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <FaLock style={iconStyle} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    style={{ paddingLeft: '42px', paddingRight: '44px' }}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    id="toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', zIndex: 1 }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '24px', marginBottom: '20px', padding: '14px' }}
              >
                {isLoading
                  ? <><Spinner /> Signing in...</>
                  : <>Sign In <FaArrowRight style={{ fontSize: '0.85rem' }} /></>
                }
              </button>
            </form>

            <div className="auth-divider">or</div>

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <Link to="/register" id="register-link" style={{ color: '#1a3c5e', fontWeight: 700, textDecoration: 'none' }}>
                Create one free <FaArrowRight style={{ fontSize: '0.75rem' }} />
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
