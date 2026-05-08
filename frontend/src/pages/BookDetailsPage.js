import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService, transactionService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FaStar, FaShoppingCart, FaHeart, FaMoneyBillWave, FaMobileAlt, FaUniversity, FaExclamationTriangle, FaEye, FaUpload, FaClock } from 'react-icons/fa';

const BookDetailsPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' });

  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentData, setPaymentData] = useState({ method: 'cod', notes: '', transaction_reference: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBookDetails = async () => {
    try {
      const bookResponse = await bookService.getBookById(bookId);
      const bookData = bookResponse.data.data;
      setBook(bookData);

      // Set default payment method to first accepted one
      if (bookData.accepted_payment_methods) {
        const firstMethod = bookData.accepted_payment_methods.split(',')[0];
        setPaymentData(prev => ({ ...prev, method: firstMethod }));
      }

      const reviewResponse = await reviewService.getSellerReviews(bookData.seller_id);
      setReviews(reviewResponse.data.data.reviews || []);
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // 💡 Real-time status updates via Socket.io
  useEffect(() => {
    if (socket && bookId) {
      const handleBookUpdate = (data) => {
        console.log(`⚡ Book status update received for ${bookId}:`, data);
        // Refresh details to get full updated object
        fetchBookDetails();
      };

      const handleTransactionUpdate = (data) => {
        console.log(`⚡ Transaction update received:`, data);
        fetchBookDetails();
      };

      // Listen for specific book changes
      socket.on(`book_status_changed_${bookId}`, handleBookUpdate);
      // Listen for user-specific transaction updates (e.g. your payment was approved)
      socket.on('transaction_updated', handleTransactionUpdate);

      return () => {
        socket.off(`book_status_changed_${bookId}`, handleBookUpdate);
        socket.off('transaction_updated', handleTransactionUpdate);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, bookId]);

  const handleInitiateBuy = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setShowCheckout(true);
  };

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();

    if (paymentData.method !== 'cod' && !paymentData.transaction_reference) {
      alert('Please enter your Transaction ID / Reference Number as proof of payment');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await transactionService.createTransaction({
        book_id: bookId,
        transaction_type: book?.book_type || 'sale',
        payment_method: paymentData.method,
        notes: paymentData.notes,
        transaction_reference: paymentData.transaction_reference
      });

      alert(response.data.message || 'Order placed! Awaiting payment verification by Admin.');
      setShowCheckout(false);
      fetchBookDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to purchase book');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await reviewService.createReview({ seller_id: book.seller_id, ...reviewData });
      setReviewData({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      fetchBookDetails();
      alert('Review submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-12 h-12"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-gray-600">Book not found</p>
      </div>
    );
  }

  // Parse accepted methods from book (stored per-book when listing)
  const acceptedMethods = (book.accepted_payment_methods || 'cod').split(',').map(m => m.trim());

  return (
    <div className="bg-light min-h-screen py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Book Image and Buy Panel */}
          <div>
            <div className="card p-6">
              <div className="w-full h-80 bg-gray-200 rounded-lg mb-6 overflow-hidden flex items-center justify-center">
                {book.image_url ? (
                  <img src={`http://localhost:5000${book.image_url}`} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 text-center">No Image Available</div>
                )}
              </div>

              {book.book_type === 'sale' ? (
                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm">Price</p>
                  <p className="text-4xl font-bold text-green-600">Rs. {book.price}</p>
                </div>
              ) : (
                <div className="text-center mb-4 bg-green-100 text-green-800 py-3 rounded-lg">
                  <p className="font-bold text-lg">FREE — For Donation</p>
                </div>
              )}

              {/* Accepted Payment Methods display */}
              {book.book_type === 'sale' && acceptedMethods.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Accepted Payments:</p>
                  <div className="flex flex-wrap gap-2">
                    {acceptedMethods.includes('cod') && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaMoneyBillWave style={{ fontSize: '0.7rem' }} /> COD</span>
                    )}
                    {acceptedMethods.includes('jazzcash') && book.jazzcash_number && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaMobileAlt style={{ fontSize: '0.7rem' }} /> JazzCash</span>
                    )}
                    {acceptedMethods.includes('easypaisa') && book.easypaisa_number && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaMobileAlt style={{ fontSize: '0.7rem' }} /> EasyPaisa</span>
                    )}
                    {acceptedMethods.includes('bank') && book.bank_details && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaUniversity style={{ fontSize: '0.7rem' }} /> Bank</span>
                    )}
                  </div>
                </div>
              )}

              {book.seller_id !== user?.userId && (
                <div className="flex flex-col gap-3">
                  {book.status === 'available' ? (
                    book.user_pending_transaction ? (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1">
                          <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                          </span>
                        </div>
                        <p className="font-bold text-lg mb-1" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaClock style={{ fontSize: '0.9rem' }} /> Payment Pending</p>
                        <p className="text-xs">Awaiting Admin Verification</p>
                        <div className="mt-2 text-[10px] text-yellow-600 font-semibold uppercase tracking-wider">
                          Live Status Updates Enabled
                        </div>
                      </div>
                    ) : (
                      <>
                        <button onClick={handleInitiateBuy} className="btn-primary w-full flex items-center justify-center gap-2">
                          <FaShoppingCart /> {book.book_type === 'sale' ? 'Buy Now' : 'Claim'}
                        </button>
                        <button className="btn-secondary w-full flex items-center justify-center gap-2">
                          <FaHeart /> Wishlist
                        </button>
                      </>
                    )
                  ) : (
                    <div className="bg-gray-100 border border-gray-200 text-gray-600 font-bold p-3 text-center rounded-lg shadow-sm">
                      {book.status === 'sold' ? 'Sold Out' : 'Unavailable'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="lg:col-span-2">
            <div className="card p-6 mb-6">
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Subject</p>
                  <p className="font-semibold">{book.subject}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Class</p>
                  <p className="font-semibold">{book.class_name || 'General'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Condition</p>
                  <p className="font-semibold capitalize">{book.condition}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Views</p>
                  <p className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaEye style={{ color: '#9ca3af', fontSize: '0.85rem' }} /> {book.views_count}</p>
                </div>
              </div>

              {book.isbn && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm">ISBN</p>
                  <p className="font-semibold">{book.isbn}</p>
                </div>
              )}

              {book.description && (
                <div>
                  <p className="text-gray-600 text-sm">Description</p>
                  <p className="text-gray-700">{book.description}</p>
                </div>
              )}
            </div>

            {/* Seller Information */}
            <div className="card p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Seller Information</h2>
              <div className="flex items-center gap-4 mb-4">
                {book.seller_image && (
                  <img src={`http://localhost:5000${book.seller_image}`} alt={book.seller_name} className="w-16 h-16 rounded-full object-cover" />
                )}
                <div>
                  <p className="text-xl font-bold">{book.seller_name}</p>
                  <p className="text-gray-600 text-sm">{book.seller_email}</p>
                  {book.store_name && <p className="text-blue-600 font-semibold">{book.store_name}</p>}
                </div>
              </div>

              {book.average_rating && (
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < Math.round(book.average_rating) ? 'text-yellow-500' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="font-semibold">{Number(book.average_rating).toFixed(1)}/5</span>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
                {isAuthenticated && book.seller_id !== user?.userId && (
                  <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-primary">
                    Add Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-light rounded-lg">
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Rating</label>
                    <select value={reviewData.rating}
                      onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                      className="input-field">
                      {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Title</label>
                    <input type="text" value={reviewData.title}
                      onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                      className="input-field" placeholder="Review title" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Comment</label>
                    <textarea value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      className="input-field h-24 resize-none" placeholder="Write your review..." />
                  </div>
                  <button type="submit" className="btn-primary">Submit Review</button>
                </form>
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-600">No reviews yet</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold">{review.reviewer_name}</p>
                          <p className="text-sm text-gray-600">{review.title}</p>
                        </div>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ CHECKOUT MODAL ══════════ */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">Complete Purchase</h2>
              <button onClick={() => setShowCheckout(false)}
                className="text-gray-400 hover:text-red-500 transition-colors text-2xl">
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmPurchase} className="p-6 overflow-y-auto max-h-[80vh]">

              {/* Book + Price Summary */}
              <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Buying</p>
                  <p className="text-sm text-gray-700 font-semibold truncate max-w-[200px]">{book.title}</p>
                  <p className="text-xs text-gray-500">Seller: {book.seller_name}</p>
                </div>
                <div className="text-right">
                  {book.book_type === 'sale' ? (
                    <p className="text-2xl font-bold text-blue-700">Rs. {book.price}</p>
                  ) : (
                    <p className="text-xl font-bold text-green-600">Free</p>
                  )}
                </div>
              </div>

              {/* ── Payment Method Selection ── */}
              {book.book_type === 'sale' && (
                <div className="mb-5">
                  <label className="block text-gray-700 font-bold mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">

                    {acceptedMethods.includes('cod') && (
                      <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                        paymentData.method === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name="paymentMethod" className="hidden" value="cod"
                          checked={paymentData.method === 'cod'}
                          onChange={(e) => setPaymentData({...paymentData, method: e.target.value})} />
                        <FaMoneyBillWave style={{ fontSize: '1.5rem', color: '#1d4ed8' }} />
                        <span className="font-bold text-blue-700 mt-1">COD</span>
                        <span className="text-xs text-gray-500 mt-1">Cash on Delivery</span>
                      </label>
                    )}

                    {acceptedMethods.includes('jazzcash') && book.jazzcash_number && (
                      <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                        paymentData.method === 'jazzcash' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name="paymentMethod" className="hidden" value="jazzcash"
                          checked={paymentData.method === 'jazzcash'}
                          onChange={(e) => setPaymentData({...paymentData, method: e.target.value})} />
                        <FaMobileAlt style={{ fontSize: '1.5rem', color: '#dc2626' }} />
                        <span className="font-bold text-red-600 mt-1">JazzCash</span>
                        <span className="text-xs text-gray-500 mt-1">Mobile Wallet</span>
                      </label>
                    )}

                    {acceptedMethods.includes('easypaisa') && book.easypaisa_number && (
                      <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                        paymentData.method === 'easypaisa' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name="paymentMethod" className="hidden" value="easypaisa"
                          checked={paymentData.method === 'easypaisa'}
                          onChange={(e) => setPaymentData({...paymentData, method: e.target.value})} />
                        <FaMobileAlt style={{ fontSize: '1.5rem', color: '#16a34a' }} />
                        <span className="font-bold text-green-600 mt-1">EasyPaisa</span>
                        <span className="text-xs text-gray-500 mt-1">Mobile Wallet</span>
                      </label>
                    )}

                    {acceptedMethods.includes('bank') && book.bank_details && (
                      <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                        paymentData.method === 'bank' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name="paymentMethod" className="hidden" value="bank"
                          checked={paymentData.method === 'bank'}
                          onChange={(e) => setPaymentData({...paymentData, method: e.target.value})} />
                        <FaUniversity style={{ fontSize: '1.5rem', color: '#7c3aed' }} />
                        <span className="font-bold text-purple-600 mt-1">Bank</span>
                        <span className="text-xs text-gray-500 mt-1">Direct Transfer</span>
                      </label>
                    )}

                  </div>
                </div>
              )}

              {/* ── Seller Account Details (shown when digital method selected) ── */}
              {paymentData.method !== 'cod' && (
                <div className="mb-5 rounded-xl border-2 border-yellow-300 bg-yellow-50 overflow-hidden">
                    <div className="bg-yellow-300 px-4 py-2 flex items-center gap-2">
                    <FaUpload style={{ color: '#78350f', fontSize: '0.9rem' }} />
                    <p className="font-bold text-yellow-900 text-sm">Send Payment to Seller's Account</p>
                  </div>
                  <div className="p-4">

                    {paymentData.method === 'jazzcash' && (
                      <>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">JazzCash Account Number</p>
                        <p className="text-3xl font-mono font-bold text-red-600 tracking-widest mb-2">
                          {book.jazzcash_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          Open your <strong>JazzCash app</strong> → Send Money → enter this number → send <strong>Rs. {book.price}</strong>
                        </p>
                      </>
                    )}

                    {paymentData.method === 'easypaisa' && (
                      <>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">EasyPaisa Account Number</p>
                        <p className="text-3xl font-mono font-bold text-green-600 tracking-widest mb-2">
                          {book.easypaisa_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          Open your <strong>EasyPaisa app</strong> → Send Money → enter this number → send <strong>Rs. {book.price}</strong>
                        </p>
                      </>
                    )}

                    {paymentData.method === 'bank' && (
                      <>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Bank Account Details</p>
                        <p className="text-sm font-mono text-purple-700 whitespace-pre-wrap font-bold mb-2">
                          {book.bank_details}
                        </p>
                        <p className="text-sm text-gray-600">
                          Make a bank transfer of <strong>Rs. {book.price}</strong> to the above account
                        </p>
                      </>
                    )}

                    <div className="mt-3 pt-3 border-t border-yellow-300">
                        <p className="text-xs text-yellow-800 font-medium" style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <FaExclamationTriangle style={{ flexShrink: 0, marginTop: '2px', color: '#92400e' }} />
                          After completing the payment, copy your Transaction ID from the app and enter it below.
                        </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Transaction Reference Input ── */}
              {paymentData.method !== 'cod' && (
                <div className="mb-5">
                  <label className="block text-gray-700 font-bold mb-2">
                    Transaction ID / Reference Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentData.transaction_reference}
                    onChange={(e) => setPaymentData({...paymentData, transaction_reference: e.target.value})}
                    className="input-field w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none"
                    placeholder="e.g. TID12345678 or your sender number"
                  />
                  <p className="text-xs text-gray-400 mt-1">This is your proof of payment shown to the seller.</p>
                </div>
              )}

              {/* Order Notes */}
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Order Notes (Optional)</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  className="input-field h-20 resize-none w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Delivery instructions or additional notes...">
                </textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCheckout(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  disabled={isProcessing}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center"
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <span className="animate-spin border-2 border-white border-t-transparent w-5 h-5 rounded-full mr-2"></span>
                  ) : null}
                  {isProcessing ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailsPage;
