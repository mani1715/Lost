import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Home } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    console.log('Login result:', result);
    setLoading(false);

    if (result.success) {
      console.log('Login successful, requiresRoleSelection:', result.requiresRoleSelection);
      if (result.requiresRoleSelection) {
        console.log('Navigating to /select-role');
        navigate('/select-role');
      } else {
        // User already has a role - redirect based on role
        const userData = result.user;
        console.log('User has role:', userData.role);
        if (userData.role === 'OWNER') {
          navigate('/owner/dashboard');
        } else if (userData.role === 'CUSTOMER') {
          navigate('/listings');
        } else {
          navigate(from, { replace: true });
        }
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Home className="h-10 w-10 text-secondary" />
            <span className="text-3xl font-bold text-foreground">RENTEASE</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            Welcome Back
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link to="/register" className="font-semibold text-secondary hover:text-secondary/80 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-secondary to-accent hover:from-[#d16a50] hover:to-[#c49565] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
