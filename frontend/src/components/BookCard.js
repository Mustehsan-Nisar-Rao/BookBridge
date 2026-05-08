import React from 'react';
import { FaEye, FaBookOpen, FaExchangeAlt, FaHandHoldingHeart, FaTag } from 'react-icons/fa';

const typeConfig = {
  sale:     { label: 'For Sale',   bg: 'rgba(26,60,94,0.1)',    color: '#1a3c5e',  icon: <FaTag /> },
  donate:   { label: 'Donation',   bg: 'rgba(74,124,89,0.12)',  color: '#4a7c59',  icon: <FaHandHoldingHeart /> },
  exchange: { label: 'Exchange',   bg: 'rgba(197,160,40,0.15)', color: '#8B6914',  icon: <FaExchangeAlt /> },
};

const conditionColors = {
  new:      { bg: 'rgba(74,124,89,0.15)',  color: '#4a7c59' },
  like_new: { bg: 'rgba(74,124,89,0.1)',   color: '#4a7c59' },
  good:     { bg: 'rgba(26,60,94,0.08)',   color: '#1a3c5e' },
  fair:     { bg: 'rgba(197,160,40,0.12)', color: '#8B6914' },
  poor:     { bg: 'rgba(220,53,69,0.1)',   color: '#dc3545' },
};

const BookCard = ({ book, onViewDetails }) => {
  const truncate = (text, len) => text?.length > len ? text.substring(0, len) + '…' : text;
  const type = typeConfig[book.book_type] || typeConfig.sale;
  const cond = conditionColors[book.condition] || conditionColors.good;
  const condLabel = book.condition?.replace('_', ' ') || 'Good';

  return (
    <div
      className="book-card"
      onClick={() => onViewDetails(book.id)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onViewDetails(book.id)}
      aria-label={`View details for ${book.title}`}
    >
      {/* Book Image */}
      <div style={{
        width: '100%', height: '180px',
        background: 'linear-gradient(135deg, #f0ebe0, #e8e0d0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative'
      }}>
        {book.image_url ? (
          <>
            <img
              src={`http://localhost:5000${book.image_url}`}
              alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
              }}
            />
            {/* Fallback shown via JS above */}
            <div style={{
              display: 'none', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', width: '100%', height: '100%', color: '#b0a99a'
            }}>
              <FaBookOpen style={{ fontSize: '2.5rem', marginBottom: '6px' }} />
              <span style={{ fontSize: '0.72rem' }}>No image</span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#b0a99a' }}>
            <FaBookOpen style={{ fontSize: '2.5rem', marginBottom: '6px' }} />
            <span style={{ fontSize: '0.72rem' }}>No image</span>
          </div>
        )}

        {/* Type Badge */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          background: type.bg, color: type.color,
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '0.7rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          display: 'flex', alignItems: 'center', gap: '4px',
          backdropFilter: 'blur(4px)',
          border: `1px solid ${type.color}30`
        }}>
          <span style={{ fontSize: '0.65rem' }}>{type.icon}</span>
          {type.label}
        </div>
      </div>

      {/* Book Info */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontWeight: 700, color: '#1a3c5e', marginBottom: '4px', fontSize: '0.95rem', lineHeight: 1.3 }}>
          {truncate(book.title, 32)}
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '10px' }}>
          by {truncate(book.author, 22)}
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {book.subject && (
            <span style={{
              background: 'rgba(26,60,94,0.06)', color: '#1a3c5e',
              padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 500
            }}>
              {book.subject}
            </span>
          )}
          <span style={{
            background: cond.bg, color: cond.color,
            padding: '2px 10px', borderRadius: '20px',
            fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize'
          }}>
            {condLabel}
          </span>
        </div>

        {/* Price / Type action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {book.book_type === 'sale' ? (
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a3c5e', fontFamily: "'Playfair Display', serif" }}>
                Rs. {Number(book.price).toLocaleString()}
              </span>
            ) : book.book_type === 'donate' ? (
              <span style={{
                background: 'rgba(74,124,89,0.12)', color: '#4a7c59',
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: '5px'
              }}>
                <FaHandHoldingHeart style={{ fontSize: '0.75rem' }} /> FREE
              </span>
            ) : (
              <span style={{
                background: 'rgba(197,160,40,0.15)', color: '#8B6914',
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: '5px'
              }}>
                <FaExchangeAlt style={{ fontSize: '0.75rem' }} /> Exchange
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '0.75rem' }}>
            <FaEye style={{ fontSize: '0.7rem' }} />
            {book.views_count || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
