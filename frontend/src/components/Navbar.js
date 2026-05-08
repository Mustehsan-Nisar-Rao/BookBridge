import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaChevronDown, FaSignOutAlt,
  FaTachometerAlt, FaUserCircle, FaPlusCircle, FaShieldAlt,
  FaBookOpen
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const dropRef                      = useRef(null);
  const location                     = useLocation();

  /* ── scroll effect ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── close menus on route change ── */
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location]);

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); window.location.href = '/'; };

  /* ── shared link style ── */
  const navLinkStyle = {
    color: '#1a3c5e',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.92rem',
    padding: '6px 14px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    letterSpacing: '0.01em',
  };
  const navLinkHover = (e, on) => {
    e.currentTarget.style.background = on ? 'rgba(26,60,94,0.07)' : 'transparent';
    e.currentTarget.style.color      = on ? '#1a3c5e' : '#1a3c5e';
  };

  /* ── user display name ── */
  const displayName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Account';

  return (
    <nav style={{
      background: scrolled ? '#ffffff' : 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid rgba(26,60,94,0.12)' : '1px solid rgba(26,60,94,0.06)',
      boxShadow: scrolled ? '0 4px 24px rgba(26,60,94,0.1)' : '0 2px 8px rgba(26,60,94,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>

          {/* ═══ LOGO ═══ */}
          <Link
            to="/"
            id="navbar-logo-link"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 }}
          >
            {/* Logo image in a contained box */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(145deg, #f5f2eb, #ede8dc)',
              border: '2px solid rgba(26,60,94,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 3px 10px rgba(26,60,94,0.12)',
              flexShrink: 0,
            }}>
              <img
                src={logo}
                alt="BookBridge"
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>

            {/* Brand text next to logo */}
            <div style={{ lineHeight: 1 }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.55rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}>
                <span style={{ color: '#1a3c5e' }}>Book</span><span style={{ color: '#4a7c59' }}>Bridge</span>
              </div>
              <div style={{
                fontSize: '0.62rem',
                letterSpacing: '0.18em',
                color: '#c5a028',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginTop: '3px',
              }}>
                Buy · Sell · Donate
              </div>
            </div>
          </Link>

          {/* ═══ DESKTOP LINKS ═══ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

            <Link
              to="/books"
              id="nav-browse-books"
              style={navLinkStyle}
              onMouseEnter={e => navLinkHover(e, true)}
              onMouseLeave={e => navLinkHover(e, false)}
            >
              <FaBookOpen style={{ marginRight: '6px', fontSize: '0.8rem', opacity: 0.7 }} />
              Browse Books
            </Link>

            {isAuthenticated && user?.role !== 'admin' && (
              <>
                <Link
                  to="/add-book"
                  id="nav-sell-book"
                  style={navLinkStyle}
                  onMouseEnter={e => navLinkHover(e, true)}
                  onMouseLeave={e => navLinkHover(e, false)}
                >
                  <FaPlusCircle style={{ marginRight: '6px', fontSize: '0.8rem', opacity: 0.7 }} />
                  Sell a Book
                </Link>
                <Link
                  to="/dashboard"
                  id="nav-dashboard"
                  style={navLinkStyle}
                  onMouseEnter={e => navLinkHover(e, true)}
                  onMouseLeave={e => navLinkHover(e, false)}
                >
                  <FaTachometerAlt style={{ marginRight: '6px', fontSize: '0.8rem', opacity: 0.7 }} />
                  Dashboard
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                id="nav-admin"
                style={{ ...navLinkStyle, color: '#4a7c59' }}
                onMouseEnter={e => navLinkHover(e, true)}
                onMouseLeave={e => navLinkHover(e, false)}
              >
                <FaShieldAlt style={{ marginRight: '6px', fontSize: '0.8rem' }} />
                Admin Panel
              </Link>
            )}
          </div>

          {/* ═══ AUTH AREA ═══ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              /* USER DROPDOWN */
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  id="user-menu-toggle"
                  onClick={() => setDropOpen(!dropOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'white',
                    border: '2px solid rgba(26,60,94,0.15)',
                    borderRadius: '40px',
                    padding: '8px 16px 8px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 8px rgba(26,60,94,0.06)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a3c5e'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,60,94,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,60,94,0.15)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,60,94,0.06)'; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a3c5e 0%, #4a7c59 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                      {displayName[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a3c5e', lineHeight: 1.1 }}>{displayName}</div>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'capitalize', lineHeight: 1.2 }}>{user?.role}</div>
                  </div>
                  <FaChevronDown style={{
                    fontSize: '0.68rem', color: '#9ca3af',
                    transition: 'transform 0.25s',
                    transform: dropOpen ? 'rotate(180deg)' : 'rotate(0)',
                  }} />
                </button>

                {dropOpen && (
                  <div
                    id="user-dropdown"
                    style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      background: 'white',
                      border: '1px solid rgba(26,60,94,0.1)',
                      borderRadius: '16px',
                      boxShadow: '0 12px 40px rgba(26,60,94,0.16)',
                      minWidth: '200px',
                      overflow: 'hidden',
                      zIndex: 9999,
                      animation: 'slideDown 0.2s ease',
                    }}
                  >
                    {/* Profile info header */}
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(26,60,94,0.06)', background: 'rgba(26,60,94,0.02)' }}>
                      <div style={{ fontWeight: 700, color: '#1a3c5e', fontSize: '0.9rem' }}>{user?.full_name || user?.name}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '2px' }}>{user?.email}</div>
                    </div>

                    {/* Links */}
                    {[
                      { to: '/profile',   icon: <FaUserCircle />,   label: 'My Profile'  },
                      { to: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard'   },
                    ].map((item, i) => (
                      <Link
                        key={i}
                        to={item.to}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 18px', color: '#374151', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,60,94,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <span style={{ color: '#4a7c59', fontSize: '0.85rem' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <div style={{ height: '1px', background: 'rgba(26,60,94,0.06)', margin: '4px 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{ width: '100%', padding: '11px 18px', background: 'none', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', color: '#dc3545', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <FaSignOutAlt style={{ fontSize: '0.85rem' }} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* GUEST BUTTONS */
              <>
                <Link
                  to="/login"
                  id="nav-signin-btn"
                  style={{
                    padding: '10px 22px',
                    border: '2px solid #1a3c5e',
                    borderRadius: '10px',
                    color: '#1a3c5e',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1a3c5e'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a3c5e'; }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  id="nav-getstarted-btn"
                  style={{
                    padding: '10px 22px',
                    background: 'linear-gradient(135deg, #1a3c5e, #2a5580)',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(26,60,94,0.3)',
                    transition: 'all 0.25s ease',
                    border: '2px solid transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,60,94,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,60,94,0.3)'; }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ═══ MOBILE HAMBURGER ═══ */}
          <button
            id="mobile-menu-toggle"
            style={{
              background: menuOpen ? 'rgba(26,60,94,0.08)' : 'none',
              border: '2px solid rgba(26,60,94,0.12)',
              borderRadius: '10px',
              padding: '8px 10px',
              cursor: 'pointer',
              color: '#1a3c5e',
              transition: 'all 0.2s',
              display: 'none',
              alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>

        {/* ═══ MOBILE MENU ═══ */}
        {menuOpen && (
          <div
            style={{
              paddingBottom: '20px',
              borderTop: '1px solid rgba(26,60,94,0.08)',
              animation: 'slideDown 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '12px' }}>
              {[
                { to: '/books', label: 'Browse Books', icon: <FaBookOpen /> },
                ...(isAuthenticated && user?.role !== 'admin'
                  ? [
                      { to: '/add-book',   label: 'Sell a Book',  icon: <FaPlusCircle />   },
                      { to: '/dashboard',  label: 'Dashboard',    icon: <FaTachometerAlt /> },
                      { to: '/profile',    label: 'My Profile',   icon: <FaUserCircle />   },
                    ]
                  : []),
                ...(isAuthenticated && user?.role === 'admin'
                  ? [{ to: '/admin', label: 'Admin Panel', icon: <FaShieldAlt /> }]
                  : []),
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.to}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 8px', color: '#1a3c5e', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', borderRadius: '10px', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,60,94,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ color: '#4a7c59' }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {/* Mobile auth */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(26,60,94,0.06)' }}>
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#fee2e2', border: 'none', borderRadius: '10px', color: '#dc3545', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/login" style={{ flex: 1, textAlign: 'center', padding: '11px', border: '2px solid #1a3c5e', borderRadius: '10px', color: '#1a3c5e', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>Sign In</Link>
                    <Link to="/register" style={{ flex: 1, textAlign: 'center', padding: '11px', background: '#1a3c5e', borderRadius: '10px', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
