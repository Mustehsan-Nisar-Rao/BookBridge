import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { bookService, transactionService } from '../services/api';
import { FaBook, FaShoppingBag, FaStar, FaDollarSign, FaSync } from 'react-icons/fa';

const DashboardPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 💡 Real-time socket listener for dashboard updates
  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        console.log('⚡ Dashboard data update received via socket');
        fetchDashboardData();
      };

      socket.on('transaction_updated', handleUpdate);
      socket.on('global_transaction_update', handleUpdate);

      return () => {
        socket.off('transaction_updated', handleUpdate);
        socket.off('global_transaction_update', handleUpdate);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await transactionService.getSalesStats();
      setStats(statsResponse.data.data);

      // Fetch seller's books
      const booksResponse = await bookService.getSellerBooks(user?.userId);
      setBooks(booksResponse.data.data.books || []);

      // Fetch transactions
      const txnResponse = await transactionService.getTransactions({ type: 'sold', limit: 5 });
      setTransactions(txnResponse.data.data.transactions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="bg-light min-h-screen py-12">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 rounded-full text-[10px] uppercase tracking-widest font-bold text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
            <button 
              onClick={fetchDashboardData}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Manual Refresh"
            >
              <FaSync className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Total Sales */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sales</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.total_sales || 0}</p>
              </div>
              <FaShoppingBag className="text-4xl text-blue-200" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">Rs. {stats?.total_revenue || 0}</p>
              </div>
              <FaDollarSign className="text-4xl text-green-200" />
            </div>
          </div>

          {/* Average Rating */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{Number(stats?.average_rating).toFixed(1) || 'N/A'}</p>
              </div>
              <FaStar className="text-4xl text-yellow-200" />
            </div>
          </div>

          {/* Active Listings */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Listings</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.active_listings || 0}</p>
              </div>
              <FaBook className="text-4xl text-purple-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Books */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6">Your Books</h2>

              {books.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No books listed yet</p>
              ) : (
                <div className="space-y-4">
                  {books.slice(0, 5).map(book => (
                    <div key={book.id} className="flex items-center justify-between p-4 border-l-4 border-blue-600">
                      <div>
                        <h3 className="font-bold">{book.title}</h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">Rs. {book.price}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          book.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Sales</h2>

              {transactions.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No sales yet</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map(txn => (
                    <div key={txn.id} className="p-4 border-b">
                      <p className="font-semibold text-sm">{txn.book_title}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-green-600 font-bold">Rs. {txn.amount}</span>
                        <div className="flex gap-2">
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize border border-gray-200">
                            {txn.payment_method === 'cod' ? 'COD' : 
                             txn.payment_method === 'jazzcash' ? 'JazzCash' : 
                             txn.payment_method === 'easypaisa' ? 'EasyPaisa' : 
                             txn.payment_method === 'bank' ? 'Bank' : 'N/A'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded border ${
                            txn.status === 'completed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                      {txn.transaction_reference && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                          <span className="font-semibold text-gray-700">Ref / TID:</span> {txn.transaction_reference}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
