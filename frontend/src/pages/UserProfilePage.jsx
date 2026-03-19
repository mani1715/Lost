import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, User, ArrowRight, CheckCircle } from 'lucide-react';

const UserProfilePage = () => {
  const { user, selectRole, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRoleSwitch = async () => {
    if (!selectedRole || selectedRole === user?.role) {
      setError('Please select a different role to switch');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await selectRole(selectedRole);
    setLoading(false);

    if (result.success) {
      setSuccess(`Successfully switched to ${selectedRole === 'OWNER' ? 'Owner' : 'Customer'} role!`);
      setTimeout(() => {
        if (selectedRole === 'OWNER') {
          navigate('/owner/dashboard');
        } else {
          navigate('/listings');
        }
      }, 1500);
    } else {
      setError(result.message || 'Failed to switch role');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="profile-title">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              data-testid="logout-button"
            >
              Logout
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-lg font-semibold text-gray-900" data-testid="profile-name">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-lg font-semibold text-gray-900" data-testid="profile-email">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Role</label>
                <div className="flex items-center space-x-2">
                  {user?.role === 'OWNER' ? (
                    <>
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <p className="text-lg font-semibold text-blue-600" data-testid="current-role">Property Owner</p>
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 text-green-600" />
                      <p className="text-lg font-semibold text-green-600" data-testid="current-role">Customer</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Switching Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Switch Role</h2>
          <p className="text-gray-600 mb-6">
            You can switch between Owner and Customer roles anytime. Your listings and data will be preserved.
          </p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800 font-medium" data-testid="error-message">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800 font-medium" data-testid="success-message">{success}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Owner Card */}
            <button
              onClick={() => setSelectedRole('OWNER')}
              disabled={user?.role === 'OWNER'}
              data-testid="switch-to-owner-btn"
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                selectedRole === 'OWNER'
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              } ${user?.role === 'OWNER' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-xl ${
                    selectedRole === 'OWNER' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Property Owner</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <span className="mr-2 text-blue-600">✓</span>
                      List and manage properties
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-blue-600">✓</span>
                      Set your own prices
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-blue-600">✓</span>
                      Chat with potential renters
                    </li>
                  </ul>
                </div>
              </div>
              {user?.role === 'OWNER' && (
                <div className="mt-3 flex items-center text-blue-600 font-medium text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Current Role
                </div>
              )}
              {selectedRole === 'OWNER' && user?.role !== 'OWNER' && (
                <div className="mt-3 flex items-center text-blue-600 font-medium text-sm">
                  <span className="bg-blue-600 text-white rounded-full p-1 mr-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Selected
                </div>
              )}
            </button>

            {/* Customer Card */}
            <button
              onClick={() => setSelectedRole('CUSTOMER')}
              disabled={user?.role === 'CUSTOMER'}
              data-testid="switch-to-customer-btn"
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                selectedRole === 'CUSTOMER'
                  ? 'border-green-600 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
              } ${user?.role === 'CUSTOMER' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-xl ${
                    selectedRole === 'CUSTOMER' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <User className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Customer</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-600">✓</span>
                      Browse available properties
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-600">✓</span>
                      Save favorites
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-600">✓</span>
                      Leave reviews and ratings
                    </li>
                  </ul>
                </div>
              </div>
              {user?.role === 'CUSTOMER' && (
                <div className="mt-3 flex items-center text-green-600 font-medium text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Current Role
                </div>
              )}
              {selectedRole === 'CUSTOMER' && user?.role !== 'CUSTOMER' && (
                <div className="mt-3 flex items-center text-green-600 font-medium text-sm">
                  <span className="bg-green-600 text-white rounded-full p-1 mr-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Selected
                </div>
              )}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleRoleSwitch}
              disabled={loading || !selectedRole || selectedRole === user?.role}
              data-testid="confirm-role-switch-btn"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Switching...
                </>
              ) : (
                <>
                  Switch Role
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            You can switch between roles anytime without losing your data
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
