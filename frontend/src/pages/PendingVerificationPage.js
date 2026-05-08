
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { FaClock, FaCheck, FaExclamationTriangle, FaSignOutAlt, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PendingVerificationPage = () => {
  const { user, logout, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [adminPaymentInfo, setAdminPaymentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    // If user is actually active, redirect to dashboard
    if (user && user.is_active) {
      navigate('/dashboard');
      return;
    }

    const fetchAdminPaymentInfo = async () => {
      try {
        const response = await authService.getAdminPaymentInfo();
        setAdminPaymentInfo(response.data.data);
      } catch (error) {
        console.error('Error fetching admin payment info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminPaymentInfo();
  }, [user, navigate]);

  const handleRefreshStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const updatedUser = await checkAuthStatus();
      if (updatedUser.is_active) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to refresh status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="bg-light min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm animate-pulse">
              <FaClock className="text-4xl" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Application Pending</h1>
            <p className="text-blue-100 opacity-90">Our administrators are currently reviewing your bookstore application.</p>
          </div>

          <div className="p-8">
            <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl mb-8">
              <FaExclamationTriangle className="text-yellow-500 text-xl mt-1 shrink-0" />
              <div>
                <p className="font-bold text-yellow-800">Verification Requried</p>
                <p className="text-sm text-yellow-700 leading-relaxed">
                  To activate your account, ensure you have transferred the annual fee of <strong>PKR 4,000</strong> to the admin account. 
                  Once confirmed, your account will be activated immediately.
                </p>
              </div>
            </div>

            {/* Admin Payment Info Card */}
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCheck className="text-green-500" /> Need to Check Admin Details?
            </h3>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
                <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
              </div>
            ) : adminPaymentInfo ? (
              <div className="space-y-3 mb-8">
                {adminPaymentInfo.jazzcash_number && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-all">
                    <span className="font-semibold text-gray-700">JazzCash</span>
                    <span className="font-mono font-bold text-red-600 text-lg">{adminPaymentInfo.jazzcash_number}</span>
                  </div>
                )}
                {adminPaymentInfo.easypaisa_number && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-all">
                    <span className="font-semibold text-gray-700">EasyPaisa</span>
                    <span className="font-mono font-bold text-green-600 text-lg">{adminPaymentInfo.easypaisa_number}</span>
                  </div>
                )}
                {adminPaymentInfo.bank_details && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="block font-semibold text-gray-700 mb-2">Bank Account</span>
                    <p className="text-sm font-mono text-gray-600 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap">{adminPaymentInfo.bank_details}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <FaExclamationTriangle className="text-yellow-400 text-3xl mb-3" />
                <p className="text-gray-500 max-w-xs mx-auto text-sm">
                  The administrator is currently updating their payment methods. 
                  Please check back in a few minutes or contact support at <span className="text-blue-600 font-semibold">support@bookbridge.com</span>.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-50">
              <button 
                onClick={handleRefreshStatus}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-4 shadow-blue-200 shadow-lg"
              >
                <FaSync /> Refresh Status
              </button>
              <button 
                onClick={logout}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 py-4"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-8">
              Logged in as <span className="font-bold text-gray-600">{user?.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingVerificationPage;
