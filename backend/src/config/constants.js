// Application Constants

const USER_ROLES = {
  STUDENT: 'student',
  BOOKSTORE: 'bookstore',
  ADMIN: 'admin'
};

const BOOK_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  NOT_AVAILABLE: 'not_available'
};

const BOOK_CONDITION = {
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
};

const TRANSACTION_TYPE = {
  SALE: 'sale',
  DONATION: 'donation',
  EXCHANGE: 'exchange'
};

const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const ADMIN_ACTIONS = {
  VERIFY_USER: 'verify_user',
  SUSPEND_USER: 'suspend_user',
  REMOVE_BOOK: 'remove_book',
  APPROVE_BOOKSTORE: 'approve_bookstore'
};

const RATING_MIN = 1;
const RATING_MAX = 5;

const COMMISSION_PERCENTAGE = parseFloat(process.env.COMMISSION_RATE) || 0.01; // 1%

const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic',
    price: 0,
    duration: null,
    listings_limit: 5
  },
  PREMIUM: {
    name: 'Premium',
    price: 500,
    duration: 365, // days
    listings_limit: 100
  }
};

const ALLOWED_EDUCATIONAL_DOMAINS = (process.env.ALLOWED_DOMAINS || 'edu,ac.uk,ac.in,pk').split(',');

module.exports = {
  USER_ROLES,
  BOOK_STATUS,
  BOOK_CONDITION,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  ADMIN_ACTIONS,
  RATING_MIN,
  RATING_MAX,
  COMMISSION_PERCENTAGE,
  SUBSCRIPTION_PLANS,
  ALLOWED_EDUCATIONAL_DOMAINS
};
