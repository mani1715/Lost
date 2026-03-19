import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, Heart, Home, Menu, X, User, LogOut, LayoutDashboard, MessageCircle, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isOwner, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-[var(--navbar-gradient-from)] to-[var(--navbar-gradient-to)] border-b border-white/5 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group" data-testid="navbar-logo">
            <Home className="h-8 w-8 text-[#D4A574] transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-white tracking-tight">RENTEASE</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search by location or property type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                data-testid="navbar-search-input"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                data-testid="navbar-search-button"
              >
                <Search className="h-5 w-5 text-white/60" />
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 text-white transition-all duration-300"
              data-testid="theme-toggle-button"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-[#D4A574] transition-transform hover:rotate-12" />
              ) : (
                <Moon className="h-5 w-5 text-white transition-transform hover:-rotate-12" />
              )}
            </button>

            {isAuthenticated && user?.role && (
              <>
                <Link to="/listings" data-testid="navbar-listings-link">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    Browse
                  </Button>
                </Link>
                
                <Link to="/favorites" data-testid="navbar-favorites-link">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    <Heart className="h-5 w-5 mr-2" />
                    Favorites
                  </Button>
                </Link>
                {user?.role === 'CUSTOMER' && (
                  <Link to="/wishlist" data-testid="navbar-wishlist-link">
                    <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                      <Heart className="h-5 w-5 mr-2 fill-red-500 text-red-500" />
                      Wishlist
                    </Button>
                  </Link>
                )}
              </>
            )}

            {isOwner && (
              <>
                <Link to="/owner/dashboard" data-testid="navbar-dashboard-link">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/owner/inbox" data-testid="navbar-inbox-link">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Messages
                  </Button>
                </Link>
                <Link to="/owner/add-listing" data-testid="navbar-add-listing-link">
                  <Button className="bg-gradient-to-r from-[#E07A5F] to-[#D4A574] hover:from-[#d16a50] hover:to-[#c49565] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                    List Property
                  </Button>
                </Link>
              </>
            )}

            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-[#E07A5F] to-[#c96b52] hover:from-[#d16a50] hover:to-[#b85e46] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-white/10 text-white transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-soft-lg py-1 z-50 border border-border">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                      <p className="text-xs text-accent font-medium mt-1.5">{user?.role}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                      data-testid="navbar-profile-link"
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      My Profile
                    </Link>
                    {isOwner && (
                      <>
                        <Link
                          to="/owner/dashboard"
                          className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/owner/inbox"
                          className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <MessageCircle className="h-4 w-4 inline mr-2" />
                          Messages
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 text-white transition-all"
              data-testid="mobile-theme-toggle-button"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-[#D4A574]" />
              ) : (
                <Moon className="h-5 w-5 text-white" />
              )}
            </button>
            
            <button
              className="text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="navbar-mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-white/10" data-testid="navbar-mobile-menu">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  data-testid="navbar-mobile-search-input"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Search className="h-5 w-5 text-white/60" />
                </button>
              </div>
            </form>
            {isAuthenticated && user?.role && (
              <>
                <Link to="/listings" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" data-testid="navbar-mobile-listings-link">
                    Browse
                  </Button>
                </Link>
                <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" data-testid="navbar-mobile-favorites-link">
                    <Heart className="h-5 w-5 mr-2" />
                    Favorites
                  </Button>
                </Link>
                {user?.role === 'CUSTOMER' && (
                  <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" data-testid="navbar-mobile-wishlist-link">
                      <Heart className="h-5 w-5 mr-2 fill-red-500 text-red-500" />
                      Wishlist
                    </Button>
                  </Link>
                )}
              </>
            )}
            {isOwner && (
              <>
                <Link to="/owner/dashboard" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/owner/inbox" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Messages
                  </Button>
                </Link>
                <Link to="/owner/add-listing" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button className="w-full bg-gradient-to-r from-[#E07A5F] to-[#D4A574] hover:from-[#d16a50] hover:to-[#c49565] text-white font-semibold rounded-xl" data-testid="navbar-mobile-add-listing-link">
                    List Property
                  </Button>
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button className="w-full bg-gradient-to-r from-[#E07A5F] to-[#c96b52] hover:from-[#d16a50] hover:to-[#b85e46] text-white font-semibold rounded-xl">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
