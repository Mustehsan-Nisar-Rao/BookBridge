import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram,
  FaHeart, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaBookOpen, FaChevronRight
} from 'react-icons/fa';
import logo from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/books', label: 'Browse Books' },
    { to: '/register', label: 'Create Account' },
    { to: '/login', label: 'Sign In' },
  ];

  const supportLinks = [
    { label: 'Help Center', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { to: '/forgot-password', label: 'Forgot Password' },
  ];

  const socials = [
    { icon: <FaFacebook />, href: '#', label: 'Facebook' },
    { icon: <FaTwitter />, href: '#', label: 'Twitter' },
    { icon: <FaLinkedin />, href: '#', label: 'LinkedIn' },
    { icon: <FaInstagram />, href: '#', label: 'Instagram' },
  ];

  const contacts = [
    { icon: <FaEnvelope />, text: 'support@bookbridge.pk' },
    { icon: <FaPhone />,    text: '+92 300 000 0000' },
    { icon: <FaMapMarkerAlt />, text: 'Lahore, Pakistan' },
  ];

  const linkHover = (e, on) => {
    e.currentTarget.style.color = on ? '#c5a028' : 'rgba(255,255,255,0.6)';
  };
  const socialHover = (e, on) => {
    e.currentTarget.style.background     = on ? 'rgba(197,160,40,0.3)' : 'rgba(255,255,255,0.08)';
    e.currentTarget.style.color          = on ? '#e8c547'              : 'rgba(255,255,255,0.7)';
    e.currentTarget.style.borderColor    = on ? '#c5a028'              : 'rgba(255,255,255,0.1)';
  };

  return (
    <footer className="footer">
      <div className="container-custom">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          paddingBottom: '40px'
        }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
              <img src={logo} alt="BookBridge" style={{ height: '70px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.8, marginBottom: '20px' }}>
              Pakistan's premier student book exchange platform. Buy. Sell. Donate.
              Books connect, we build the bridge.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {socials.map((s, i) => (
                <a
                  key={i} href={s.href} aria-label={s.label}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                    transition: 'all 0.3s ease', fontSize: '0.9rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={e => socialHover(e, true)}
                  onMouseLeave={e => socialHover(e, false)}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>
              Quick Links
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {quickLinks.map((l, i) => (
                <li key={i}>
                  <Link
                    to={l.to}
                    style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onMouseEnter={e => linkHover(e, true)}
                    onMouseLeave={e => linkHover(e, false)}
                  >
                    <FaChevronRight style={{ fontSize: '0.65rem' }} /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>
              Support
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {supportLinks.map((l, i) => (
                <li key={i}>
                  {l.to ? (
                    <Link
                      to={l.to}
                      style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onMouseEnter={e => linkHover(e, true)}
                      onMouseLeave={e => linkHover(e, false)}
                    >
                      <FaChevronRight style={{ fontSize: '0.65rem' }} /> {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onMouseEnter={e => linkHover(e, true)}
                      onMouseLeave={e => linkHover(e, false)}
                    >
                      <FaChevronRight style={{ fontSize: '0.65rem' }} /> {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>
              Contact Us
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contacts.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                  <span style={{ color: '#c5a028', fontSize: '0.9rem', flexShrink: 0 }}>{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>

            {/* Mini logo watermark */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
                <FaBookOpen style={{ color: '#c5a028', fontSize: '1rem' }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Books connect. We build the bridge.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
              © {currentYear} BookBridge. All rights reserved.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Made with <FaHeart style={{ color: '#dc3545', fontSize: '0.8rem' }} /> by the BookBridge Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
