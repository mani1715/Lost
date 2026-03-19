import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Plus, Home, Star, Eye, MessageCircle } from 'lucide-react';
import { DEMO_MODE } from '@/config/demo';
import { mockListings } from '@/data/mockListings';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalReviews: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Demo Mode: Use mock data
      if (DEMO_MODE) {
        const demoListings = mockListings.slice(0, 3).map(l => ({
          _id: l.id,
          title: l.title,
          type: l.type,
          price: l.price,
          addressText: l.location,
          images: l.images
        }));
        setListings(demoListings);
        setStats({ totalListings: demoListings.length, totalReviews: 5, averageRating: 4.5 });
        setProfile({ contactNumber: '+91 9876543210', description: 'Demo Property Owner' });
        setLoading(false);
        return;
      }
      
      // Real Mode: Fetch from backend
      // Fetch owner's listings
      const listingsRes = await axios.get(`${API_URL}/api/listings?ownerId=${user.id}`);
      if (listingsRes.data.success) {
        setListings(listingsRes.data.listings);
        setStats(prev => ({ ...prev, totalListings: listingsRes.data.listings.length }));
      }

      // Fetch owner profile
      try {
        const profileRes = await axios.get(`${API_URL}/api/owner/profile`);
        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }
      } catch (error) {
        // Profile doesn't exist yet
        console.log('No profile found');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to demo data
      const demoListings = mockListings.slice(0, 3).map(l => ({
        _id: l.id,
        title: l.title,
        type: l.type,
        price: l.price,
        addressText: l.location,
        images: l.images
      }));
      setListings(demoListings);
      setProfile({ contactNumber: '+91 9876543210', description: 'Property Owner' });
      setLoading(false);
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await axios.delete(`${API_URL}/api/listings/${id}`);
      setListings(listings.filter(l => l._id !== id));
    } catch (error) {
      alert('Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E07A5F] mx-auto"></div>
          <p className="mt-4 text-[#64748b]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a2744]">Owner Dashboard</h1>
          <p className="mt-2 text-[#64748b]">Welcome back, {user?.name}!</p>
        </div>

        {/* Profile Alert */}
        {!profile && (
          <div className="mb-6 bg-gradient-to-r from-[#E07A5F]/10 to-[#D4A574]/10 border border-[#E07A5F]/20 rounded-xl p-4">
            <p className="text-[#1a2744]">
              ⚠️ Please complete your owner profile to start adding listings.
              <Link to="/owner/profile" className="ml-2 font-medium text-[#E07A5F] underline">
                Complete Profile
              </Link>
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e5e2de]">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-[#E07A5F]/20 to-[#D4A574]/20 rounded-xl">
                <Home className="h-6 w-6 text-[#E07A5F]" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-[#64748b]">Total Listings</p>
                <p className="text-2xl font-bold text-[#1a2744]">{stats.totalListings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e5e2de]">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-[#D4A574]/20 to-[#E07A5F]/20 rounded-xl">
                <Star className="h-6 w-6 text-[#D4A574]" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-[#64748b]">Total Reviews</p>
                <p className="text-2xl font-bold text-[#1a2744]">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e5e2de]">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-[#1a2744]/10 to-[#243b5e]/10 rounded-xl">
                <Eye className="h-6 w-6 text-[#1a2744]" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-[#64748b]">Avg Rating</p>
                <p className="text-2xl font-bold text-[#1a2744]">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/owner/add-listing"
            className={`flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#E07A5F] to-[#D4A574] text-white rounded-xl hover:from-[#d16a50] hover:to-[#c49565] transition shadow-lg ${
              !profile ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            <Plus className="mr-2" />
            Add New Listing
          </Link>
          <Link
            to="/owner/profile"
            className="flex items-center justify-center px-6 py-4 bg-white text-[#1a2744] border-2 border-[#e5e2de] rounded-xl hover:border-[#E07A5F] transition"
          >
            {profile ? 'Edit Profile' : 'Complete Profile'}
          </Link>
          <Link
            to="/owner/inbox"
            className="flex items-center justify-center px-6 py-4 bg-white text-[#1a2744] border-2 border-[#e5e2de] rounded-xl hover:border-[#E07A5F] transition"
          >
            <MessageCircle className="mr-2" />
            View Messages
          </Link>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-xl shadow-lg border border-[#e5e2de]">
          <div className="px-6 py-4 border-b border-[#e5e2de]">
            <h2 className="text-xl font-bold text-[#1a2744]">My Listings</h2>
          </div>
          <div className="p-6">
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 text-[#94a3b8] mx-auto mb-4" />
                <p className="text-[#64748b]">No listings yet</p>
                {profile && (
                  <Link
                    to="/owner/add-listing"
                    className="mt-4 inline-block text-[#E07A5F] hover:text-[#d16a50] font-medium"
                  >
                    Add your first listing
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing._id} className="border border-[#e5e2de] rounded-xl overflow-hidden hover:shadow-lg transition">
                    <div className="h-48 bg-[#f5f3f0]">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#94a3b8]">
                          <Home className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-[#1a2744] mb-2">{listing.title}</h3>
                      <p className="text-sm text-[#64748b] mb-2">{listing.addressText}</p>
                      <p className="text-lg font-bold text-[#E07A5F] mb-4">₹ {listing.price.toLocaleString('en-IN')} / month</p>
                      <div className="flex space-x-2">
                        <Link
                          to={`/listing/${listing._id}`}
                          className="flex-1 px-3 py-2 bg-[#f5f3f0] text-[#1a2744] text-sm rounded-lg hover:bg-[#e5e2de] text-center transition"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => deleteListing(listing._id)}
                          className="flex-1 px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
