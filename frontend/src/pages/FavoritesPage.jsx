import { useState, useEffect } from 'react';
import { mockListings } from '@/data/mockListings';
import { getFavorites } from '@/utils/localStorage';
import { ListingCard } from '@/components/ListingCard';
import { Heart } from 'lucide-react';
import { SkeletonList } from '@/components/SkeletonLoader';

export default function FavoritesPage() {
  const [favoriteListings, setFavoriteListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for skeleton
    setLoading(true);
    const timer = setTimeout(() => {
      const favoriteIds = getFavorites();
      const favorites = mockListings.filter(listing => favoriteIds.includes(listing.id));
      setFavoriteListings(favorites);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const favoriteIds = getFavorites();
      const favorites = mockListings.filter(listing => favoriteIds.includes(listing.id));
      setFavoriteListings(favorites);
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }} data-testid="favorites-page-title">
            My Favorites
          </h1>
          <p className="text-gray-600" data-testid="favorites-count">
            {favoriteListings.length} {favoriteListings.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        {loading ? (
          <SkeletonList count={6} />
        ) : favoriteListings.length === 0 ? (
          <div className="text-center py-16" data-testid="no-favorites-message">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1F2937' }}>
              No Favorites Yet
            </h2>
            <p className="text-gray-600">
              Start browsing and save properties you like to see them here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="favorites-grid">
            {favoriteListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
