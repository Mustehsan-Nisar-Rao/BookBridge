import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    address: user?.address || '',
    bio: user?.bio || '',
    jazzcash_number: user?.jazzcash_number || '',
    easypaisa_number: user?.easypaisa_number || '',
    bank_details: user?.bank_details || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.updateProfile(formData);
      updateUser({ ...user, ...formData });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authService.changePassword(passwordData);
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-light min-h-screen py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Account Information</h2>

            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Full Name</p>
                <p className="text-lg font-semibold">{user?.full_name}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-lg font-semibold">{user?.email}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Role</p>
                <p className="text-lg font-semibold capitalize">{user?.role}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">University</p>
                <p className="text-lg font-semibold">{user?.university || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-lg font-semibold">
                  {user?.is_verified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-600">⏳ Pending Verification</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2">
            <div className="card p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleProfileChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleProfileChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleProfileChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleProfileChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleProfileChange}
                      className="input-field h-24 resize-none"
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <h3 className="text-xl font-bold mt-8 mb-4 border-b pb-2">Payment Details (For Sellers)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">JazzCash Number</label>
                      <input
                        type="text"
                        name="jazzcash_number"
                        value={formData.jazzcash_number}
                        onChange={handleProfileChange}
                        className="input-field border-red-200 focus:border-red-500 focus:ring-red-200"
                        placeholder="e.g. 03001234567"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">EasyPaisa Number</label>
                      <input
                        type="text"
                        name="easypaisa_number"
                        value={formData.easypaisa_number}
                        onChange={handleProfileChange}
                        className="input-field border-green-200 focus:border-green-500 focus:ring-green-200"
                        placeholder="e.g. 03451234567"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Bank Account Details</label>
                    <textarea
                      name="bank_details"
                      value={formData.bank_details}
                      onChange={handleProfileChange}
                      className="input-field h-24 resize-none border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                      placeholder="Bank Name, Account Title, IBAN / Account Number"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-700"><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
                  <p className="text-gray-700"><strong>City:</strong> {formData.city || 'Not provided'}</p>
                  <p className="text-gray-700"><strong>Address:</strong> {formData.address || 'Not provided'}</p>
                  <p className="text-gray-700"><strong>Bio:</strong> {formData.bio || 'Not provided'}</p>
                  
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-lg font-bold mb-3">Payment Details</h3>
                    <p className="text-gray-700"><strong>JazzCash:</strong> {formData.jazzcash_number || <span className="text-gray-400 italic">Not set</span>}</p>
                    <p className="text-gray-700"><strong>EasyPaisa:</strong> {formData.easypaisa_number || <span className="text-gray-400 italic">Not set</span>}</p>
                    <p className="text-gray-700"><strong>Bank Details:</strong> {formData.bank_details || <span className="text-gray-400 italic">Not set</span>}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Form */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-4">Change Password</h2>

              <form onSubmit={handleChangePassword}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
