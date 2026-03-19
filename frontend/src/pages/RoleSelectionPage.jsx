import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, User, ArrowRight } from 'lucide-react';

const RoleSelectionPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { selectRole, user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  console.log('RoleSelectionPage - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);

  // Redirect to login if not authenticated (after auth loading is complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // If user already has a role, redirect to appropriate page
  useEffect(() => {
    if (!authLoading && user?.role) {
      console.log('User already has role:', user.role, 'redirecting...');
      if (user.role === 'OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else if (user.role === 'CUSTOMER') {
        navigate('/listings', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    const result = await selectRole(selectedRole);
    setLoading(false);

    if (result.success) {
      if (selectedRole === 'OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/listings');
      }
    } else {
      setError(result.message);
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-foreground mb-2" data-testid="role-selection-title">
            How would you like to use RentEase?
          </h2>
          <p className="text-muted-foreground">
            {user?.name ? `Welcome ${user.name}! ` : ''}Select your role to continue. You can switch roles anytime from your profile.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium" data-testid="role-error">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Owner Card */}
          <button
            onClick={() => setSelectedRole('OWNER')}
            data-testid="role-owner-btn"
            className={`p-8 rounded-xl border-2 transition-all text-left ${
              selectedRole === 'OWNER'
                ? 'border-secondary bg-secondary/10 shadow-lg transform scale-[1.02]'
                : 'border-border bg-card hover:border-secondary/50 hover:shadow-md'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-4 rounded-xl ${
                  selectedRole === 'OWNER' ? 'bg-gradient-to-br from-secondary to-accent text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Building2 className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">Property Owner</h3>
                <p className="text-muted-foreground mb-4">
                  List your properties for rent and manage bookings
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <span className="mr-2 text-secondary">✓</span>
                    Add and manage listings
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-secondary">✓</span>
                    Set your own prices
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-secondary">✓</span>
                    Chat with potential renters
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-secondary">✓</span>
                    Track property performance
                  </li>
                </ul>
              </div>
            </div>
            {selectedRole === 'OWNER' && (
              <div className="mt-4 flex items-center text-secondary font-medium text-sm">
                <span className="bg-secondary text-white rounded-full p-1 mr-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
            data-testid="role-customer-btn"
            className={`p-8 rounded-xl border-2 transition-all text-left ${
              selectedRole === 'CUSTOMER'
                ? 'border-primary bg-primary/10 shadow-lg transform scale-[1.02]'
                : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-4 rounded-xl ${
                  selectedRole === 'CUSTOMER' ? 'bg-gradient-to-br from-primary to-primary/80 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                <User className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">Customer</h3>
                <p className="text-muted-foreground mb-4">
                  Find and rent properties that match your needs
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <span className="mr-2 text-primary dark:text-secondary">✓</span>
                    Browse available properties
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-primary dark:text-secondary">✓</span>
                    Save favorites
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-primary dark:text-secondary">✓</span>
                    Contact property owners
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-primary dark:text-secondary">✓</span>
                    Leave reviews and ratings
                  </li>
                </ul>
              </div>
            </div>
            {selectedRole === 'CUSTOMER' && (
              <div className="mt-4 flex items-center text-primary dark:text-secondary font-medium text-sm">
                <span className="bg-primary dark:bg-secondary text-white rounded-full p-1 mr-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                Selected
              </div>
            )}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleRoleSelect}
            disabled={!selectedRole || loading}
            data-testid="role-continue-btn"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-secondary to-accent hover:from-[#d16a50] hover:to-[#c49565] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirming...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
          <p className="mt-4 text-sm text-muted-foreground">
            You can switch between Owner and Customer anytime from settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
