import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight, FaUsers, FaStar, FaLeaf, FaShieldAlt,
  FaBookOpen, FaHeart, FaChevronRight, FaMoneyBillWave,
  FaExchangeAlt, FaHandHoldingHeart, FaUserPlus,
  FaSearch, FaComments, FaCheckCircle, FaLock, FaUniversity,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

/* Intersection Observer scroll animation */
const useScrollAnimation = () => {
  useEffect(() => {
    const sections = document.querySelectorAll('section.scroll-animate');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.08 }
    );
    sections.forEach((s) => {
      s.style.opacity = '0';
      s.style.transform = 'translateY(24px)';
      s.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
      observer.observe(s);
    });
    return () => observer.disconnect();
  }, []);
};

/* ─── Sub-components ─────────────────────────────────────── */

const FeatureCard = ({ icon, title, desc, iconColor, iconBg }) => (
  <div className="feature-card animate-fade-up">
    <div className="feature-icon" style={{ background: iconBg, color: iconColor }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a3c5e', marginBottom: '10px' }}>{title}</h3>
    <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
  </div>
);

const StepCard = ({ stepNum, icon, title, desc }) => (
  <div className="step-card">
    <div className="step-number">{stepNum}</div>
    <div style={{ fontSize: '1.5rem', color: '#4a7c59', marginBottom: '12px' }}>{icon}</div>
    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a3c5e', marginBottom: '8px' }}>{title}</h3>
    <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
  </div>
);

const TestimonialCard = ({ name, uni, text, rating }) => (
  <div className="testimonial-card">
    <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
      {[...Array(rating)].map((_, i) => (
        <FaStar key={i} style={{ color: '#c5a028', fontSize: '0.9rem' }} />
      ))}
    </div>
    <p style={{ color: '#4b5563', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.7 }}>
      "{text}"
    </p>
    <div>
      <div style={{ fontWeight: 700, color: '#1a3c5e', fontSize: '0.95rem' }}>{name}</div>
      <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '2px' }}>
        <FaUniversity style={{ marginRight: '4px', fontSize: '0.75rem' }} />
        {uni}
      </div>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
const HomePage = () => {
  const { isAuthenticated } = useAuth();
  useScrollAnimation();

  const features = [
    {
      icon: <FaMoneyBillWave size={24} />,
      title: 'Save Money',
      desc: 'Buy and sell used academic books at affordable prices. Significantly reduce your educational costs.',
      iconColor: '#1a3c5e',
      iconBg: 'rgba(26,60,94,0.1)',
    },
    {
      icon: <FaShieldAlt size={22} />,
      title: 'Verified Students',
      desc: 'Connect with verified students using institutional emails for a trusted, safe trading community.',
      iconColor: '#4a7c59',
      iconBg: 'rgba(74,124,89,0.1)',
    },
    {
      icon: <FaStar size={22} />,
      title: 'Trusted Ratings',
      desc: 'Read genuine reviews from fellow students about sellers and book conditions before buying.',
      iconColor: '#c5a028',
      iconBg: 'rgba(197,160,40,0.12)',
    },
    {
      icon: <FaLeaf size={22} />,
      title: 'Go Green',
      desc: 'Promote sustainability by donating and exchanging books. Together, we reduce waste and save trees.',
      iconColor: '#4a7c59',
      iconBg: 'rgba(74,124,89,0.1)',
    },
  ];

  const steps = [
    { stepNum: '1', icon: <FaUserPlus />, title: 'Create Account', desc: 'Sign up free with your email and join thousands of students.' },
    { stepNum: '2', icon: <FaSearch />,    title: 'Browse Books',    desc: 'Search and filter by subject, class, condition, and price.' },
    { stepNum: '3', icon: <FaComments />,  title: 'Connect & Negotiate', desc: 'Message sellers directly, negotiate prices, and arrange pickup.' },
    { stepNum: '4', icon: <FaCheckCircle />, title: 'Rate & Review',  desc: 'Complete the transaction and leave a review for the community.' },
  ];

  const testimonials = [
    { name: 'Ahmed Raza', uni: 'LUMS, Lahore',     rating: 5, text: 'BookBridge saved me thousands on textbooks! The process was smooth and I found exactly what I needed for my engineering courses.' },
    { name: 'Sara Khan',  uni: 'FAST-NUCES',        rating: 5, text: 'Amazing platform! I sold my old CS books within 2 days and donated some to students in need. Highly recommended!' },
    { name: 'Bilal Mirza',uni: 'UET Lahore',         rating: 5, text: 'The verification system makes it so trustworthy. No more sketchy deals — just students helping students!' },
  ];

  const listingTypes = [
    {
      icon: <FaMoneyBillWave size={32} />,
      title: 'Buy & Sell',
      desc: 'List your books for sale at a price you choose, or find books from other students at great deals.',
      color: '#1a3c5e',
      gradient: 'linear-gradient(135deg,rgba(26,60,94,0.05),rgba(26,60,94,0.1))',
    },
    {
      icon: <FaHandHoldingHeart size={32} />,
      title: 'Donate',
      desc: 'Give your used books to students in need. Make education accessible to everyone around you.',
      color: '#4a7c59',
      gradient: 'linear-gradient(135deg,rgba(74,124,89,0.05),rgba(74,124,89,0.1))',
    },
    {
      icon: <FaExchangeAlt size={32} />,
      title: 'Exchange',
      desc: 'Swap your books with other students. Trade your completed semester books for what you need now.',
      color: '#c5a028',
      gradient: 'linear-gradient(135deg,rgba(197,160,40,0.05),rgba(197,160,40,0.1))',
    },
  ];

  return (
    <div style={{ background: '#faf8f3' }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        className="hero-section"
        style={{ opacity: 1, transform: 'none', padding: '80px 0 120px', position: 'relative' }}
      >
        <div className="container-custom" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>

            {/* Left */}
            <div className="animate-fade-left">
              {/* Trust pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px',
                padding: '8px 18px', marginBottom: '28px'
              }}>
                <FaHeart style={{ color: '#c5a028', fontSize: '0.85rem' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: 500 }}>
                  Books connect. We build the bridge.
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.2rem,4vw,3.4rem)', fontWeight: 700,
                color: 'white', lineHeight: 1.15, marginBottom: '20px'
              }}>
                Buy. Sell. Donate.<br />
                <span className="gradient-text">Academic Books</span><br />
                Made Simple.
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '36px', maxWidth: '440px' }}>
                Join Pakistan's premier student book exchange platform. Save money, share knowledge, and make a difference — all in one place.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/books" className="btn btn-gold btn-lg" id="hero-browse-btn">
                  Browse Books <FaArrowRight style={{ fontSize: '0.9rem' }} />
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn btn-outline-white btn-lg" id="hero-getstarted-btn">
                    Get Started Free
                  </Link>
                )}
              </div>

              {/* Trust indicators */}
              <div style={{ display: 'flex', gap: '24px', marginTop: '40px', flexWrap: 'wrap' }}>
                {[
                  { icon: <FaLock style={{ fontSize: '0.8rem' }} />,       text: 'Verified Students' },
                  { icon: <FaStar style={{ fontSize: '0.8rem' }} />,        text: 'Trusted Reviews'  },
                  { icon: <FaLeaf style={{ fontSize: '0.8rem' }} />,        text: 'Eco Friendly'     },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
                    <span style={{ color: '#c5a028' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Logo visual */}
            <div className="animate-fade-right" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                <div
                  className="animate-float"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '28px',
                    padding: '40px 32px',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Real logo */}
                  <img
                    src={logo}
                    alt="BookBridge"
                    style={{
                      width: '200px',
                      height: 'auto',
                      filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
                      marginBottom: '16px',
                    }}
                  />
                  <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                    10,000+ Books Available
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', marginTop: '6px' }}>
                    Across all disciplines and universities
                  </div>

                  {/* Floating stat — top right */}
                  <div style={{
                    position: 'absolute', top: '-18px', right: '-20px',
                    background: 'white', borderRadius: '14px', padding: '14px 18px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4a7c59', fontFamily: "'Playfair Display', serif" }}>98%</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>Happy Buyers</div>
                  </div>

                  {/* Floating stat — bottom left */}
                  <div style={{
                    position: 'absolute', bottom: '-14px', left: '-20px',
                    background: 'white', borderRadius: '14px', padding: '14px 18px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a3c5e', fontFamily: "'Playfair Display', serif" }}>5K+</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>Students Joined</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" style={{ display: 'block', width: '100%' }}>
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#faf8f3" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section style={{ opacity: 1, transform: 'none', background: 'white', padding: '48px 0', borderBottom: '1px solid rgba(26,60,94,0.06)' }}>
        <div className="container-custom">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
            {[
              { n: '10,000+', l: 'Books Listed',     icon: <FaBookOpen /> },
              { n: '5,000+',  l: 'Active Students',  icon: <FaUsers />    },
              { n: 'PKR 2M+', l: 'Student Savings',  icon: <FaMoneyBillWave /> },
              { n: '50+',     l: 'Universities',     icon: <FaUniversity /> },
            ].map((s, i) => (
              <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ color: '#4a7c59', fontSize: '1.2rem', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a3c5e', fontFamily: "'Playfair Display', serif" }}>{s.n}</div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="scroll-animate" style={{ padding: '96px 0', background: '#faf8f3' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="section-tag">Why BookBridge?</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', color: '#1a3c5e', marginBottom: '16px' }}>
              Everything You Need to Exchange Books
            </h2>
            <p style={{ color: '#6b7280', maxWidth: '540px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
              A complete platform designed for Pakistani students to buy, sell, and donate academic books safely and easily.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '24px' }}>
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="scroll-animate" style={{ padding: '96px 0', background: 'white' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="section-tag">Simple Process</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', color: '#1a3c5e', marginBottom: '16px' }}>
              How BookBridge Works
            </h2>
            <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              Get started in minutes. Our streamlined process makes buying and selling books effortless.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            {/* Connector line (desktop) */}
            <div style={{
              position: 'absolute', top: '26px', left: '12.5%', right: '12.5%',
              height: '2px', background: 'linear-gradient(to right,#1a3c5e,#4a7c59)',
              zIndex: 0
            }} className="hidden md:block" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '24px', position: 'relative', zIndex: 1 }}>
              {steps.map((s, i) => <StepCard key={i} {...s} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LISTING TYPES
      ══════════════════════════════════════════ */}
      <section className="scroll-animate" style={{ padding: '96px 0', background: 'linear-gradient(135deg,#faf8f3,#f0ebe0)' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="section-tag">Listing Types</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', color: '#1a3c5e', marginBottom: '16px' }}>
              Three Ways to Exchange Books
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '28px' }}>
            {listingTypes.map((item, i) => (
              <div key={i} className="card" style={{ padding: '36px', textAlign: 'center', background: item.gradient }}>
                <div style={{ color: item.color, marginBottom: '20px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.3rem', color: item.color, marginBottom: '12px', fontWeight: 700 }}>{item.title}</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.95rem' }}>{item.desc}</p>
                <Link
                  to="/books"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '20px', color: item.color, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  Explore <FaChevronRight style={{ fontSize: '0.75rem' }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="scroll-animate" style={{ padding: '96px 0', background: 'white' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="section-tag">Student Stories</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', color: '#1a3c5e', marginBottom: '16px' }}>
              Loved by Students Across Pakistan
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px' }}>
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section
        className="scroll-animate"
        style={{ padding: '100px 0', background: 'linear-gradient(135deg,#1a3c5e 0%,#0f2337 50%,#355c42 100%)', position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(74,124,89,0.2) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(197,160,40,0.15) 0%,transparent 70%)' }} />

        <div className="container-custom" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Logo in CTA */}
          <img
            src={logo}
            alt="BookBridge"
            style={{ height: '90px', width: 'auto', marginBottom: '24px', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
          />
          <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', color: 'white', marginBottom: '16px' }}>
            Ready to Start Exchanging Books?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Join thousands of Pakistani students already saving money and sharing knowledge through BookBridge.
          </p>

          {!isAuthenticated ? (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-gold btn-lg" id="cta-register-btn">
                Start for Free <FaArrowRight style={{ fontSize: '0.9rem' }} />
              </Link>
              <Link to="/login" className="btn btn-outline-white btn-lg" id="cta-login-btn">
                Already have an account?
              </Link>
            </div>
          ) : (
            <Link to="/books" className="btn btn-gold btn-lg" id="cta-browse-btn">
              Browse Books Now <FaArrowRight style={{ fontSize: '0.9rem' }} />
            </Link>
          )}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
