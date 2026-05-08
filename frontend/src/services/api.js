import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  getAdminPaymentInfo: () => api.get('/auth/admin-payment-info'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

export const bookService = {
  addBook: (data) => api.post('/books', data, {
    headers: { 'Content-Type': undefined }
  }),
  getBooks: (filters) => api.get('/books', { params: filters }),
  getBookById: (bookId) => api.get(`/books/${bookId}`),
  updateBook: (bookId, data) => api.put(`/books/${bookId}`, data),
  deleteBook: (bookId) => api.delete(`/books/${bookId}`),
  getSellerBooks: (sellerId, params) => api.get(`/books/seller/${sellerId}`, { params })
};

export const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  getSellerReviews: (sellerId, params) => api.get(`/reviews/seller/${sellerId}`, { params }),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`)
};

export const transactionService = {
  createTransaction: (data) => api.post('/transactions', data),
  getTransactions: (params) => api.get('/transactions', { params }),
  getTransactionById: (transactionId) => api.get(`/transactions/${transactionId}`),
  updateTransaction: (transactionId, data) => api.put(`/transactions/${transactionId}`, data),
  getSalesStats: () => api.get('/transactions/stats/dashboard')
};

export const adminService = {
  // Users
  getAllUsers: (params) => api.get('/admin/users', { params }),
  verifyUser: (userId) => api.put(`/admin/users/${userId}/verify`),
  suspendUser: (userId) => api.put(`/admin/users/${userId}/suspend`),
  activateUser: (userId) => api.put(`/admin/users/${userId}/activate`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  // Bookstores
  getBookstoreRequests: (params) => api.get('/admin/bookstores', { params }),
  approveBookstore: (bookstoreId) => api.put(`/admin/bookstores/${bookstoreId}/approve`),
  rejectBookstore: (bookstoreId) => api.put(`/admin/bookstores/${bookstoreId}/reject`),
  // Books
  getAllBooks: (params) => api.get('/admin/books', { params }),
  removeBook: (bookId, data) => api.delete(`/admin/books/${bookId}`, { data }),
  // Reviews
  getAllReviews: (params) => api.get('/admin/reviews', { params }),
  approveReview: (reviewId) => api.put(`/admin/reviews/${reviewId}/approve`),
  rejectReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),
  // Stats & Logs
  getPlatformStats: () => api.get('/admin/statistics'),
  getAdminLogs: (params) => api.get('/admin/logs', { params }),
  getPendingTransactions: (params) => api.get('/admin/transactions/pending', { params }),
  adminVerifyTransaction: (transactionId, data) => api.put(`/admin/transactions/${transactionId}/verify`, data)
};

export default api;
