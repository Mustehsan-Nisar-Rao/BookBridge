import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { adminService } from '../services/api';
import {
  FaUsers, FaBook, FaChartBar, FaList, FaStore, FaStar,
  FaCheck, FaBan, FaTrash, FaSearch, FaUserShield, FaSync,
  FaArrowUp, FaExclamationTriangle, FaUserCheck, FaUserTimes
} from 'react-icons/fa';

const AdminPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookstores, setBookstores] = useState([]);
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [paymentType, setPaymentType] = useState('sales');
  const [txnStatus, setTxnStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  const [selectedBookstore, setSelectedBookstore] = useState(null);

  const showMessage = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
  };

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 💡 Always fetch platform stats to keep the "Pending" badge updated
      const statsResponse = await adminService.getPlatformStats();
      setStats(statsResponse.data.data);

      // Fetch tab-specific data
      if (activeTab === 'users') {
        const response = await adminService.getAllUsers({ limit: 50, search: searchQuery || undefined });
        setUsers(response.data.data.users);
      } else if (activeTab === 'bookstores') {
        const response = await adminService.getBookstoreRequests({ limit: 50, status: 'all' });
        setBookstores(response.data.data.bookstores);
      } else if (activeTab === 'books') {
        const response = await adminService.getAllBooks({ limit: 50, search: searchQuery || undefined });
        setBooks(response.data.data.books);
      } else if (activeTab === 'reviews') {
        const response = await adminService.getAllReviews({ limit: 50 });
        setReviews(response.data.data.reviews);
      } else if (activeTab === 'logs') {
        const response = await adminService.getAdminLogs({ limit: 50 });
        setLogs(response.data.data.logs);
      } else if (activeTab === 'payments') {
        const response = await adminService.getPendingTransactions({
          status: txnStatus,
          limit: 50
        });
        setPendingTransactions(response.data.data.transactions || []);

        // Also fetch bookstores based on status
        const bsResponse = await adminService.getBookstoreRequests({
          limit: 50,
          status: txnStatus === 'completed' ? 'approved' : 'pending'
        });
        setBookstores(bsResponse.data.data.bookstores || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showMessage('Failed to load data. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, txnStatus]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // 💡 Real-time socket listener for admin updates
  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        console.log('⚡ Admin data update received via socket');
        fetchAdminData();
      };

      socket.on('admin_data_updated', handleUpdate);
      socket.on('global_transaction_update', handleUpdate);

      return () => {
        socket.off('admin_data_updated', handleUpdate);
        socket.off('global_transaction_update', handleUpdate);
      };
    }
  }, [socket, fetchAdminData]);

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const handleVerifyUser = async (userId) => {
    try {
      await adminService.verifyUser(userId);
      showMessage('User verified successfully!');
      fetchAdminData();
    } catch (error) {
      showMessage('Failed to verify user.', 'error');
    }
  };

  const handleSuspendUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to suspend "${userName}"?`)) return;
    try {
      await adminService.suspendUser(userId);
      showMessage('User suspended successfully!');
      fetchAdminData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to suspend user.', 'error');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminService.activateUser(userId);
      showMessage('User activated successfully!');
      fetchAdminData();
    } catch (error) {
      showMessage('Failed to activate user.', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`⚠️ PERMANENTLY DELETE "${userName}"? This cannot be undone!`)) return;
    try {
      await adminService.deleteUser(userId);
      showMessage('User deleted successfully!');
      fetchAdminData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete user.', 'error');
    }
  };

  const handleApproveBookstore = async (bookstoreId) => {
    try {
      await adminService.approveBookstore(bookstoreId);
      showMessage('Bookstore approved!');
      fetchAdminData();
    } catch (error) {
      showMessage('Failed to approve bookstore.', 'error');
    }
  };

  const handleRejectBookstore = async (bookstoreId, storeName) => {
    if (!window.confirm(`Reject bookstore "${storeName}"? This will delete the application.`)) return;
    try {
      await adminService.rejectBookstore(bookstoreId);
      showMessage('Bookstore rejected!');
      fetchAdminData();
    } catch (error) {
      showMessage('Failed to reject bookstore.', 'error');
    }
  };

  const handleRemoveBook = async (bookId, bookTitle) => {
    if (!window.confirm(`Remove book "${bookTitle}"?`)) return;
    try {
      await adminService.removeBook(bookId, { reason: 'Removed by admin' });
      showMessage('Book removed!');
      fetchAdminData();
    } catch (error) {
      showMessage('Failed to remove book.', 'error');
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await adminService.approveReview(reviewId);
      showMessage('Review approved!');
      fetchAdminData();
    } catch (error) {
      showMessage('Failed to approve review.', 'error');
    }
  };

  const handleRejectReview = async (reviewId) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await adminService.rejectReview(reviewId);
      showMessage('Review rejected!');
      fetchAdminData();
    } catch (error) {
      showMessage('Failed to reject review.', 'error');
    }
  };

  const handleApprovePayment = async (transactionId) => {
    if (!window.confirm('Confirm that payment has been received and mark this book as SOLD?')) return;
    try {
      await adminService.adminVerifyTransaction(transactionId, { action: 'approve' });
      showMessage('✅ Payment approved! Book marked as sold.');
      fetchAdminData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to approve payment.', 'error');
    }
  };

  const handleRejectPayment = async (transactionId) => {
    const reason = window.prompt('Reason for rejection (optional):') || 'Invalid payment';
    try {
      await adminService.adminVerifyTransaction(transactionId, { action: 'reject', reason });
      showMessage('❌ Payment rejected. Book is available again.');
      fetchAdminData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to reject payment.', 'error');
    }
  };

  // ============================================
  // ACCESS CONTROL
  // ============================================

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // ============================================
  // TAB CONFIG
  // ============================================

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: FaChartBar },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'bookstores', label: 'Bookstores', icon: FaStore },
    { id: 'books', label: 'Books', icon: FaBook },
    { id: 'reviews', label: 'Reviews', icon: FaStar },
    {
      id: 'payments',
      label: 'Payments',
      icon: FaCheck,
      badge: stats?.pending_transactions > 0 ? stats.pending_transactions : null
    },
    { id: 'logs', label: 'Activity Logs', icon: FaList },
  ];

  // ============================================
  // RENDER HELPERS
  // ============================================

  const RoleBadge = ({ role }) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      bookstore: 'bg-blue-100 text-blue-700 border-blue-200',
      student: 'bg-green-100 text-green-700 border-green-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    );
  };

  const StatusBadge = ({ active, verified }) => {
    if (!active) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Suspended</span>;
    if (!verified) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">Unverified</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Active</span>;
  };

  const StatCard = ({ icon: Icon, label, value, color, subText }) => (
    <div className="admin-stat-card bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-all duration-300" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon className="text-xl" style={{ color }} />
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="admin-header text-white py-8 px-6" style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)'
      }}>
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FaUserShield className="text-2xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 rounded-full text-[10px] uppercase tracking-widest font-bold text-green-300">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </div>
                <p className="text-blue-100 text-sm mt-1">BookBridge Platform Management</p>
              </div>
            </div>
            <button
              onClick={() => fetchAdminData()}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all backdrop-blur-sm"
            >
              <FaSync className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Action Message Toast */}
      {actionMessage.text && (
        <div className={`fixed top-20 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-fadeIn ${actionMessage.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}>
          {actionMessage.text}
        </div>
      )}

      <div className="container-custom py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-xl shadow-sm p-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium text-sm transition-all duration-200 relative ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon /> {tab.label}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar (for users and books tabs) */}
        {(activeTab === 'users' || activeTab === 'books') && (
          <div className="mb-6 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'users' ? 'Search users by name or email...' : 'Search books by title, author, or seller...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAdminData()}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-14 h-14 mb-4"></div>
            <p className="text-gray-500">Loading admin data...</p>
          </div>
        ) : (
          <>
            {/* ========== STATISTICS TAB ========== */}
            {activeTab === 'stats' && stats && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Platform Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard icon={FaUsers} label="Total Users" value={stats.total_users} color="#2563eb" subText={`+${stats.new_users_month} this month`} />
                  <StatCard icon={FaUserCheck} label="Active Users" value={stats.active_users} color="#10b981" />
                  <StatCard icon={FaUserTimes} label="Suspended" value={stats.suspended_users} color="#ef4444" />
                  <StatCard icon={FaExclamationTriangle} label="Unverified" value={stats.unverified_users} color="#f59e0b" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard icon={FaStore} label="Approved Stores" value={stats.total_bookstores} color="#7c3aed" subText={`${stats.pending_bookstores} pending`} />
                  <StatCard icon={FaBook} label="Total Books" value={stats.total_books} color="#0891b2" subText={`${stats.available_books} available`} />
                  <StatCard icon={FaStar} label="Reviews" value={stats.total_reviews} color="#eab308" />
                  <StatCard icon={FaArrowUp} label="Transactions" value={stats.total_transactions} color="#f97316" subText={`${stats.pending_transactions} pending verification`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard icon={FaChartBar} label="Total Revenue" value={`Rs. ${Number(stats.total_revenue).toLocaleString()}`} color="#059669" />
                  <StatCard icon={FaChartBar} label="Commissions Earned" value={`Rs. ${Number(stats.total_commissions).toLocaleString()}`} color="#7c3aed" />
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <p className="text-sm text-gray-500 font-medium mb-3">User Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students</span>
                        <span className="font-bold text-green-600">{stats.students}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.total_users ? (stats.students / stats.total_users * 100) : 0}%` }}></div></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Bookstores</span>
                        <span className="font-bold text-blue-600">{stats.bookstore_users}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.total_users ? (stats.bookstore_users / stats.total_users * 100) : 0}%` }}></div></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Admins</span>
                        <span className="font-bold text-purple-600">{stats.admins}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${stats.total_users ? (stats.admins / stats.total_users * 100) : 0}%` }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== USERS TAB ========== */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">All Users ({users.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-8 text-gray-400">No users found</td></tr>
                      ) : users.map(u => (
                        <tr key={u.id} className="hover:bg-blue-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {u.full_name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{u.full_name}</p>
                                {u.university && <p className="text-xs text-gray-400">{u.university}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{u.email}</td>
                          <td className="py-3 px-4"><RoleBadge role={u.role} /></td>
                          <td className="py-3 px-4"><StatusBadge active={u.is_active} verified={u.is_verified} /></td>
                          <td className="py-3 px-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 flex-wrap">
                              {!u.is_verified && (
                                <button onClick={() => handleVerifyUser(u.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                                  title="Verify user">
                                  <FaCheck /> Verify
                                </button>
                              )}
                              {u.role !== 'admin' && u.is_active && (
                                <button onClick={() => handleSuspendUser(u.id, u.full_name)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors"
                                  title="Suspend user">
                                  <FaBan /> Suspend
                                </button>
                              )}
                              {u.role !== 'admin' && !u.is_active && (
                                <button onClick={() => handleActivateUser(u.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                                  title="Reactivate user">
                                  <FaSync /> Activate
                                </button>
                              )}
                              {u.role !== 'admin' && (
                                <button onClick={() => handleDeleteUser(u.id, u.full_name)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                                  title="Delete user permanently">
                                  <FaTrash /> Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========== BOOKSTORES TAB ========== */}
            {activeTab === 'bookstores' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-bold text-gray-700">Bookstore Applications ({bookstores.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Store Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Owner</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Applied</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookstores.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-8 text-gray-400">No bookstore applications</td></tr>
                      ) : bookstores.map(bs => (
                        <tr key={bs.id} className="hover:bg-blue-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-800">{bs.store_name}</td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-800">{bs.full_name}</p>
                            <p className="text-xs text-gray-400">{bs.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${bs.payment_method === 'jazzcash' ? 'bg-red-500' : bs.payment_method === 'easypaisa' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                <span className="text-xs font-bold text-gray-700 capitalize">{bs.payment_method || 'N/A'}</span>
                              </div>
                              <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-fit">{bs.payment_reference || 'No Reference'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {bs.is_approved ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Approved</span>
                            ) : bs.payment_status === 'rejected' ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Rejected</span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{new Date(bs.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <button onClick={() => setSelectedBookstore(bs)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                              View
                            </button>
                            {!bs.is_approved && (
                              <>
                                <button onClick={() => handleApproveBookstore(bs.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                                  <FaCheck /> Approve
                                </button>
                                <button onClick={() => handleRejectBookstore(bs.id, bs.store_name)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">
                                  <FaBan /> Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========== BOOKS TAB ========== */}
            {activeTab === 'books' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-bold text-gray-700">All Books ({books.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Author</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Seller</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {books.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-8 text-gray-400">No books found</td></tr>
                      ) : books.map(book => (
                        <tr key={book.id} className="hover:bg-blue-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{book.title}</p>
                            <p className="text-xs text-gray-400">{book.subject}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{book.author}</td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-800">{book.seller_name}</p>
                            <p className="text-xs text-gray-400">{book.seller_email}</p>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                            {book.book_type === 'donation' ? (
                              <span className="text-green-600">Free (Donation)</span>
                            ) : (
                              `Rs. ${book.price}`
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${book.status === 'available' ? 'bg-green-100 text-green-700' :
                                book.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {book.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => handleRemoveBook(book.id, book.title)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">
                              <FaTrash /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========== REVIEWS TAB ========== */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Review Moderation ({reviews.length})</h2>
                {reviews.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">No reviews to moderate</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-800">{review.reviewer_name}</p>
                            <p className="text-xs text-gray-400">reviewed {review.seller_name}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'} />
                            ))}
                          </div>
                        </div>
                        {review.title && <p className="font-semibold text-gray-700 text-sm mb-1">{review.title}</p>}
                        {review.comment && <p className="text-sm text-gray-600 mb-3">{review.comment}</p>}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {review.is_approved ? (
                              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Approved</span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Pending</span>
                            )}
                            <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-2">
                            {!review.is_approved && (
                              <button onClick={() => handleApproveReview(review.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                                <FaCheck /> Approve
                              </button>
                            )}
                            <button onClick={() => handleRejectReview(review.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* ========== PAYMENT VERIFICATION TAB ========== */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-700 text-lg">💳 Payment Verification</h3>
                    <p className="text-xs text-gray-500 mt-1">Review buyer payments and bookstore subscriptions</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Type Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => setPaymentType('sales')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${paymentType === 'sales' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Book Sales
                      </button>
                      <button
                        onClick={() => setPaymentType('bookstores')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${paymentType === 'bookstores' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Bookstore Subs
                      </button>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => setTxnStatus('pending')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${txnStatus === 'pending' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setTxnStatus('completed')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${txnStatus === 'completed' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Approved/Sold
                      </button>
                    </div>
                  </div>
                </div>

                {paymentType === 'bookstores' ? (
                  <div className="divide-y divide-gray-100">
                    {bookstores.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">{txnStatus === 'pending' ? '🏪' : '✅'}</div>
                        <p className="font-semibold">{txnStatus === 'pending' ? 'No pending bookstore subscriptions!' : 'No approved bookstores found in archives.'}</p>
                      </div>
                    ) : (
                      bookstores.map(bs => (
                        <div key={bs.id} className="p-5 hover:bg-blue-50 transition-colors">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">🏪</span>
                                <div>
                                  <p className="font-bold text-gray-800 text-base">{bs.store_name}</p>
                                  <p className="text-xs text-gray-500">Subscription Request · {new Date(bs.created_at).toLocaleString()}</p>
                                </div>
                                {bs.is_approved ? (
                                  <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                    ✅ Activated
                                  </span>
                                ) : (
                                  <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                                    ⏳ Pending Activation
                                  </span>
                                )}
                              </div>
                              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-3">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Applicant Info</p>
                                <p className="font-bold text-gray-800">{bs.full_name}</p>
                                <p className="text-sm text-gray-500">{bs.email}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                                  <p className="text-[10px] text-indigo-500 font-bold uppercase mb-1">Fee Amount</p>
                                  <p className="text-lg font-black text-indigo-700">Rs. {Number(bs.subscription_amount).toLocaleString()}</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                  <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Method Used</p>
                                  <p className="text-lg font-black text-blue-700 capitalize">{bs.payment_method}</p>
                                </div>
                              </div>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 border-dashed">
                                <p className="text-xs text-yellow-700 font-bold uppercase mb-1">🧾 TID</p>
                                <p className="font-mono text-xl font-bold text-gray-800 tracking-widest">{bs.payment_reference}</p>
                              </div>
                            </div>
                            {!bs.is_approved && (
                              <div className="flex flex-col gap-2">
                                <button onClick={() => handleApproveBookstore(bs.id)} className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                                  <FaCheck /> Approve
                                </button>
                                <button onClick={() => handleRejectBookstore(bs.id, bs.store_name)} className="px-6 py-3 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-all">
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pendingTransactions.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <p className="font-semibold">No transactions found.</p>
                      </div>
                    ) : (
                      pendingTransactions.map(txn => (
                        <div key={txn.id} className="p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">📚</span>
                                <div>
                                  <p className="font-bold text-gray-800 text-sm">{txn.book_title}</p>
                                  <p className="text-xs text-gray-500">#{txn.id} · {new Date(txn.created_at).toLocaleString()}</p>
                                </div>
                                {txn.status === 'completed' && (
                                  <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                    ✅ Payment Verified
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                  <p className="text-xs text-blue-500 font-semibold mb-1">👤 BUYER</p>
                                  <p className="font-bold text-sm text-gray-800">{txn.buyer_name}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                  <p className="text-xs text-green-500 font-semibold mb-1">🏪 SELLER</p>
                                  <p className="font-bold text-sm text-gray-800">{txn.seller_name}</p>
                                </div>
                              </div>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-xs text-yellow-700 font-semibold uppercase">🧾 TID: {txn.transaction_reference}</p>
                                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Fee: 1%</span>
                                </div>
                                <div className="flex justify-between items-end">
                                  <p className="font-bold text-sm text-gray-800">Rs. {txn.amount} <span className="text-[10px] text-gray-400 font-normal">via {txn.payment_method}</span></p>
                                  <p className="text-xs font-bold text-blue-600">Commission: Rs. {(txn.amount * 0.01).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                            {txn.status === 'pending' ? (
                              <div className="flex flex-col gap-2 min-w-[120px]">
                                <button onClick={() => handleApprovePayment(txn.id)} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm">Approve</button>
                                <button onClick={() => handleRejectPayment(txn.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm">Reject</button>
                              </div>
                            ) : txn.status === 'completed' ? (
                              <div className="flex flex-col items-center justify-center bg-green-50 rounded-xl p-3 border border-green-100 min-w-[120px]">
                                <span className="text-green-600 text-xl mb-1">💸</span>
                                <span className="text-[10px] font-bold text-green-700 uppercase">Paid & Sold</span>
                                <span className="text-[9px] text-green-500 mt-1">{new Date(txn.completed_at).toLocaleDateString()}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-bold text-gray-700">Activity Logs ({logs.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Admin</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Resource</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {logs.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-8 text-gray-400">No activity logs yet</td></tr>
                      ) : logs.map(log => (
                        <tr key={log.id} className="hover:bg-blue-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{log.admin_name}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                              {log.action_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{log.resource_type} #{log.resource_id}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{log.description}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Bookstore Detail Modal */}
      {selectedBookstore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Bookstore Application</h2>
              <button onClick={() => setSelectedBookstore(null)} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Store Name</p>
                  <p className="font-semibold text-gray-800">{selectedBookstore.store_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Registration #</p>
                  <p className="font-semibold text-gray-800">{selectedBookstore.registration_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Owner Name</p>
                  <p className="font-semibold text-gray-800">{selectedBookstore.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                  <p className="font-semibold text-gray-800">{selectedBookstore.email}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">University</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{selectedBookstore.university || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Store Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{selectedBookstore.store_description || 'No description provided.'}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  💳 Payment Verification
                  <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded text-blue-700">Rs. 4,000</span>
                </h4>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-tight">Method</span>
                    <span className="text-sm font-bold text-gray-800 capitalize">{selectedBookstore.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-tight">Reference (TID)</span>
                    <span className="text-sm font-mono font-bold text-blue-800">{selectedBookstore.payment_reference || 'NONE'}</span>
                  </div>
                  {selectedBookstore.payment_notes && (
                    <div className="mt-2 text-xs text-blue-700 italic border-t border-blue-200 pt-2">
                      " {selectedBookstore.payment_notes} "
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex gap-3">
              <button
                onClick={() => setSelectedBookstore(null)}
                className="flex-1 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {!selectedBookstore.is_approved && (
                <button
                  onClick={() => { handleApproveBookstore(selectedBookstore.id); setSelectedBookstore(null); }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md transition-colors"
                >
                  Confirm & Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
