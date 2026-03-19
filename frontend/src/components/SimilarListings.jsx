import { mockListings } from '@/data/mockListings';
import { ListingCard } from '@/components/ListingCard';

export const SimilarListings = ({ currentListingId, type, maxItems = 3 }) => {
  const similarListings = mockListings
    .filter(listing => 
      listing.id !== currentListingId && 
      listing.type === type
    )
    .slice(0, maxItems);

  if (similarListings.length === 0) {
    return null;
  }

  return (
    <div className="mt-12" data-testid="similar-listings">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#1F2937' }}>
        Similar Properties
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarListings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};
