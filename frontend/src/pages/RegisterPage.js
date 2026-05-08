import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaUniversity, FaStore, FaCheck, FaExclamationTriangle, FaArrowRight, FaCreditCard, FaInfoCircle } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    university: '',
    store_name: '',
    registration_number: '',
    store_description: '',
    subscription_payment_method: 'jazzcash',
    subscription_payment_reference: '',
    subscription_payment_notes: '',
    jazzcash_number: '',
    easypaisa_number: '',
    bank_details: ''
  });
  const [adminPaymentInfo, setAdminPaymentInfo] = useState(null);
  const [paymentInfoError, setPaymentInfoError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  useEffect(() => {
    const fetchAdminPaymentInfo = async () => {
      try {
        const response = await authService.getAdminPaymentInfo();
        setAdminPaymentInfo(response.data.data);
      } catch {
        setAdminPaymentInfo(null);
        setPaymentInfoError('Admin payment instructions are not available yet.');
      }
    };
    fetchAdminPaymentInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        university: formData.university,
        store_name: formData.store_name,
        registration_number: formData.registration_number,
        store_description: formData.store_description,
        payment_method: formData.subscription_payment_method,
        payment_reference: formData.subscription_payment_reference,
        payment_notes: formData.subscription_payment_notes,
        jazzcash_number: formData.jazzcash_number,
        easypaisa_number: formData.easypaisa_number,
        bank_details: formData.bank_details
      });

      if (response.data.role === 'bookstore' && response.data.is_active === false) {
        alert('Registration successful! Your bookstore account is pending admin verification. We will notify you once your payment is confirmed.');
        navigate('/login');
        return;
      }
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student', desc: 'Buy & sell books from fellow students', icon: <FaUniversity style={{ fontSize: '1rem', color: formData.role === 'student' ? 'white' : '#6b7280' }} /> },
    { value: 'bookstore', label: 'Bookstore (Premium)', desc: 'Register your bookstore — PKR 4,000/year', icon: <FaStore style={{ fontSize: '1rem', color: formData.role === 'bookstore' ? 'white' : '#6b7280' }} /> },
    { value: 'admin', label: 'Admin', desc: 'Platform administrator account', icon: <FaCheck style={{ fontSize: '1rem', color: formData.role === 'admin' ? 'white' : '#6b7280' }} /> }
  ];

  const inputStyle = { paddingLeft: '42px' };
  const iconStyle = {
    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
    color: '#9ca3af', fontSize: '0.95rem', zIndex: 1
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Background decorations */}
      <div style={{
        position: 'fixed', top: '15%', left: '3%',
        width: '80px', height: '80px', background: 'rgba(197,160,40,0.1)',
        borderRadius: '50%', animation: 'float 4s ease-in-out infinite', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', right: '5%',
        width: '60px', height: '60px', background: 'rgba(74,124,89,0.12)',
        borderRadius: '50%', animation: 'float 6s ease-in-out infinite reverse', zIndex: 0
      }} />

      <div className="auth-card" style={{ maxWidth: '560px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="auth-header">
          <img src={logo} alt="BookBridge" style={{ height: '72px', width: 'auto', marginBottom: '8px', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '1.7rem', color: '#1a3c5e', marginBottom: '6px' }}>
            Join BookBridge
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Create your free account and start exchanging books today
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '18px' }}>
            <label className="label" htmlFor="reg-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={iconStyle} />
              <input
                id="reg-name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input-field"
                style={inputStyle}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label className="label" htmlFor="reg-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={iconStyle} />
              <input
                id="reg-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                style={inputStyle}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Account Type Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label className="label">Account Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {roleOptions.map((opt) => (
                <label key={opt.value} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                  border: `2px solid ${formData.role === opt.value ? '#1a3c5e' : '#e2e8f0'}`,
                  background: formData.role === opt.value ? 'rgba(26,60,94,0.04)' : 'white',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={formData.role === opt.value}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: formData.role === opt.value ? 'linear-gradient(135deg, #1a3c5e, #4a7c59)' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0, transition: 'all 0.2s'
                  }}>
                    {opt.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: formData.role === opt.value ? '#1a3c5e' : '#374151', fontSize: '0.9rem' }}>{opt.label}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                  {formData.role === opt.value && (
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: '#1a3c5e', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FaCheck style={{ color: 'white', fontSize: '0.6rem' }} />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Student Fields */}
          {formData.role === 'student' && (
            <div style={{ marginBottom: '18px' }}>
              <label className="label" htmlFor="reg-university">University / College</label>
              <div style={{ position: 'relative' }}>
                <FaUniversity style={iconStyle} />
                <input
                  id="reg-university"
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="input-field"
                  style={inputStyle}
                  placeholder="e.g. LUMS, FAST-NUCES, UET"
                  required={formData.role === 'student'}
                />
              </div>
            </div>
          )}

          {/* Bookstore Fields */}
          {formData.role === 'bookstore' && (
            <div style={{
              marginBottom: '20px', padding: '20px',
              background: 'linear-gradient(135deg, rgba(197,160,40,0.05), rgba(197,160,40,0.1))',
              borderRadius: '14px', border: '1px solid rgba(197,160,40,0.2)'
            }}>
              <h3 style={{ color: '#1a3c5e', fontWeight: 700, marginBottom: '4px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaStore style={{ color: '#4a7c59' }} /> Bookstore Registration
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '16px' }}>
                Annual subscription: <strong>PKR 4,000</strong>. Account stays pending until admin verifies payment.
              </p>

              <div style={{ marginBottom: '14px' }}>
                <label className="label">Store Name *</label>
                <div style={{ position: 'relative' }}>
                  <FaStore style={iconStyle} />
                  <input
                    type="text" name="store_name" value={formData.store_name}
                    onChange={handleChange} className="input-field" style={inputStyle}
                    placeholder="Your Bookstore Name" required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label">Registration Number (Optional)</label>
                <input
                  type="text" name="registration_number" value={formData.registration_number}
                  onChange={handleChange} className="input-field"
                  placeholder="Official registration number (if any)"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label">Store Description (Optional)</label>
                <textarea
                  name="store_description" value={formData.store_description}
                  onChange={handleChange} className="input-field"
                  style={{ height: '80px', resize: 'none' }}
                  placeholder="Tell us about your bookstore..."
                />
              </div>

              {/* Admin Payment Info */}
              <div style={{
                padding: '16px', borderRadius: '12px',
                background: 'white', border: '1px solid rgba(26,60,94,0.12)',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <FaCreditCard style={{ color: '#1a3c5e', fontSize: '1.2rem' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a3c5e', fontSize: '0.9rem' }}>Admin Payment Details</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Transfer fee to activate your store</div>
                  </div>
                </div>

                {adminPaymentInfo ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '4px' }}>
                      Transfer exactly <strong>PKR 4,000</strong> to activate your store.
                    </p>
                    {adminPaymentInfo.jazzcash_number && (
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px', borderRadius: '8px', background: '#fee2e2', border: '1px solid #fecaca'
                      }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#991b1b' }}>JazzCash</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#dc2626' }}>{adminPaymentInfo.jazzcash_number}</span>
                      </div>
                    )}
                    {adminPaymentInfo.easypaisa_number && (
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px', borderRadius: '8px', background: '#dcfce7', border: '1px solid #bbf7d0'
                      }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#166534' }}>EasyPaisa</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>{adminPaymentInfo.easypaisa_number}</span>
                      </div>
                    )}
                    {adminPaymentInfo.bank_details && (
                      <div style={{ padding: '10px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1d4ed8', marginBottom: '6px' }}>Bank Transfer</div>
                        <pre style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#374151', whiteSpace: 'pre-wrap' }}>
                          {adminPaymentInfo.bank_details}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#9ca3af', fontSize: '0.85rem' }}>
                    <FaInfoCircle style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '8px' }} />
                    <div>{paymentInfoError || 'Loading payment instructions...'}</div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label">Payment Method Used</label>
                <select name="subscription_payment_method" value={formData.subscription_payment_method} onChange={handleChange} className="input-field">
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label">Transaction ID / Reference *</label>
                <input
                  type="text" name="subscription_payment_reference" value={formData.subscription_payment_reference}
                  onChange={handleChange} className="input-field" style={{ fontFamily: 'monospace' }}
                  placeholder="Enter the 10-12 digit TID" required
                />
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '4px' }}>Enter the reference ID from your transfer confirmation</p>
              </div>

              <div>
                <label className="label">Additional Notes (Optional)</label>
                <textarea
                  name="subscription_payment_notes" value={formData.subscription_payment_notes}
                  onChange={handleChange} className="input-field"
                  style={{ height: '70px', resize: 'none' }}
                  placeholder="e.g. Name of account you sent from"
                />
              </div>
            </div>
          )}

          {/* Admin Payment Setup */}
          {formData.role === 'admin' && (
            <div style={{
              marginBottom: '20px', padding: '20px',
              background: 'rgba(26,60,94,0.04)', borderRadius: '14px',
              border: '1px solid rgba(26,60,94,0.12)'
            }}>
              <h3 style={{ color: '#1a3c5e', fontWeight: 700, marginBottom: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCreditCard style={{ color: '#4a7c59' }} /> Admin Payment Setup
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '16px' }}>
                Provide at least one payment method to accept bookstore subscriptions.
              </p>
              {[
                { name: 'jazzcash_number', label: 'JazzCash Number', placeholder: 'JazzCash mobile number' },
                { name: 'easypaisa_number', label: 'EasyPaisa Number', placeholder: 'EasyPaisa mobile number' },
              ].map((f) => (
                <div key={f.name} style={{ marginBottom: '14px' }}>
                  <label className="label">{f.label}</label>
                  <input type="text" name={f.name} value={formData[f.name]} onChange={handleChange} className="input-field" placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="label">Bank Details</label>
                <textarea
                  name="bank_details" value={formData.bank_details} onChange={handleChange}
                  className="input-field" style={{ height: '90px' }}
                  placeholder="Account title, IBAN, branch, bank name"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div style={{ marginBottom: '18px' }}>
            <label className="label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={iconStyle} />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password" value={formData.password}
                onChange={handleChange} className="input-field"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '28px' }}>
            <label className="label" htmlFor="reg-confirm-password">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={iconStyle} />
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} className="input-field"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                placeholder="Repeat your password"
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '20px', padding: '14px' }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                Creating Account...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                Create Free Account <FaArrowRight style={{ fontSize: '0.85rem' }} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-divider">already have an account?</div>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
          <Link to="/login" id="login-link" style={{ color: '#1a3c5e', fontWeight: 700, textDecoration: 'none' }}>
            Sign in instead →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
