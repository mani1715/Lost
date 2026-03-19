import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ListingCard } from '@/components/ListingCard';
import { FilterPanel } from '@/components/FilterPanel';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { SkeletonList } from '@/components/SkeletonLoader';
import { DEMO_MODE } from '@/config/demo';
import { mockListings } from '@/data/mockListings';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function ListingsPage() {
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    types: [],
    duration: 'all',
    mode: 'all',
    availability: 'all',
    minPrice: 0,
    maxPrice: 5000
  });

  useEffect(() => {
    fetchListings();
  }, [searchParams, filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // Demo Mode: Use mock data
      if (DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        setListings(mockListings);
        setLoading(false);
        return;
      }
      
      // Real Mode: Fetch from backend
      const type = searchParams.get('type');
      const search = searchParams.get('search');
      
      // Build query params
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (search) params.append('location', search);
      if (filters.minPrice > 0) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice < 5000) params.append('maxPrice', filters.maxPrice);
      if (filters.availability && filters.availability !== 'all') {
        params.append('status', filters.availability);
      }

      const response = await axios.get(`${API_URL}/api/listings?${params.toString()}`);
      
      if (response.data.success) {
        setListings(response.data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Fallback to mock data on error
      setListings(mockListings);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    // Filter by property type
    if (filters.types.length > 0 && !filters.types.includes(listing.type)) {
      return false;
    }
    // Filter by availability status
    if (filters.availability && filters.availability !== 'all') {
      const listingStatus = listing.status || 'available';
      if (filters.availability === 'available' && listingStatus !== 'available') {
        return false;
      }
      if (filters.availability === 'rented' && listingStatus === 'available') {
        return false;
      }
    }
    return true;
  });

  // Calculate availability stats
  const availableCount = filteredListings.filter(l => (l.status || 'available') === 'available').length;
  const rentedCount = filteredListings.filter(l => l.status === 'rented').length;

  const handleResetFilters = () => {
    setFilters({
      types: [],
      duration: 'all',
      mode: 'all',
      availability: 'all',
      minPrice: 0,
      maxPrice: 5000
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="listings-page-title">
              Available Properties
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <p className="text-muted-foreground" data-testid="listings-count">
                {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
              </p>
              {/* Availability Stats */}
              <div className="flex items-center gap-4 text-sm" data-testid="availability-stats">
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  {availableCount} Available
                </span>
                <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  {rentedCount} Rented
                </span>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="lg:hidden border-border text-foreground"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            data-testid="mobile-filters-toggle"
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-80 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleResetFilters}
            />
          </aside>

          <main className="flex-1">
            {loading ? (
              <SkeletonList count={9} />
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12" data-testid="no-listings-message">
                <p className="text-xl text-muted-foreground">No properties match your filters.</p>
                <Button
                  onClick={handleResetFilters}
                  className="mt-4 bg-gradient-to-r from-secondary to-accent hover:from-[#d16a50] hover:to-[#c49565] text-white"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="listings-grid">
                {filteredListings.map(listing => (
                  <ListingCard key={listing.id || listing._id} listing={listing} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
