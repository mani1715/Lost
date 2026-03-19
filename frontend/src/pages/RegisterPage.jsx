import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(formData.name, formData.email, formData.password);
    console.log('Registration result:', result);
    setLoading(false);

    if (result.success) {
      console.log('Registration successful, navigating to /select-role');
      // After registration, redirect to role selection
      navigate('/select-role');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Home className="h-10 w-10 text-[#E07A5F]" />
            <span className="text-3xl font-bold text-[#1a2744]">RENTEASE</span>
          </div>
          <h2 className="text-4xl font-extrabold text-[#1a2744] mb-2">
            Create Your Account
          </h2>
          <p className="text-lg text-[#64748b]">
            Join us to find your perfect rental space or list your property
          </p>
          <p className="mt-2 text-sm text-[#64748b]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#E07A5F] hover:text-[#d16a50] transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="register-form">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600 font-medium" data-testid="register-error">{error}</p>
              </div>
            )}

            {/* Personal Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#1a2744] mb-2">
                Full Name <span className="text-[#E07A5F]">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                data-testid="register-name-input"
                className="w-full px-4 py-3 border border-[#e5e2de] placeholder-[#94a3b8] text-[#1a2744] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20 focus:border-[#E07A5F] transition-all"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1a2744] mb-2">
                Email Address <span className="text-[#E07A5F]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                data-testid="register-email-input"
                className="w-full px-4 py-3 border border-[#e5e2de] placeholder-[#94a3b8] text-[#1a2744] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20 focus:border-[#E07A5F] transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1a2744] mb-2">
                Password <span className="text-[#E07A5F]">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                data-testid="register-password-input"
                className="w-full px-4 py-3 border border-[#e5e2de] placeholder-[#94a3b8] text-[#1a2744] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20 focus:border-[#E07A5F] transition-all"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#1a2744] mb-2">
                Confirm Password <span className="text-[#E07A5F]">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                data-testid="register-confirm-password-input"
                className="w-full px-4 py-3 border border-[#e5e2de] placeholder-[#94a3b8] text-[#1a2744] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20 focus:border-[#E07A5F] transition-all"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Info Note */}
            <div className="bg-gradient-to-r from-[#E07A5F]/10 to-[#D4A574]/10 border border-[#E07A5F]/20 rounded-xl p-4">
              <p className="text-sm text-[#1a2744]">
                After signup, you'll be able to choose whether you want to be a <strong>Property Owner</strong> or a <strong>Customer</strong>.
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                data-testid="register-submit-btn"
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-[#E07A5F] to-[#D4A574] hover:from-[#d16a50] hover:to-[#c49565] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E07A5F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Your Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-sm text-[#94a3b8]">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
