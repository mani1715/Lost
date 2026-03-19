import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ReviewCard } from './ReviewCard';
import { AddReviewForm } from './AddReviewForm';
import { reviewService } from '@/services/reviewService';
import { toast } from 'sonner';

export const ReviewsSection = ({ propertyId, currentUserId, userRole }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getReviews(propertyId);
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);

      // Check if current user has already reviewed
      if (currentUserId) {
        const existing = data.reviews.find(r => r.user._id === currentUserId);
        setUserReview(existing || null);
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews([newReview, ...reviews]);
    setUserReview(newReview);
    setTotalReviews(totalReviews + 1);
    // Recalculate average
    const newAvg = ((averageRating * totalReviews) + newReview.rating) / (totalReviews + 1);
    setAverageRating(newAvg);
  };

  const handleReviewUpdate = (updatedReview) => {
    setReviews(reviews.map(r => r._id === updatedReview._id ? updatedReview : r));
    setUserReview(updatedReview);
    // Recalculate average
    const sum = reviews.reduce((acc, r) => {
      return acc + (r._id === updatedReview._id ? updatedReview.rating : r.rating);
    }, 0);
    setAverageRating(sum / reviews.length);
  };

  const handleReviewDelete = (reviewId) => {
    const deletedReview = reviews.find(r => r._id === reviewId);
    const newReviews = reviews.filter(r => r._id !== reviewId);
    setReviews(newReviews);
    setUserReview(null);
    setTotalReviews(totalReviews - 1);
    
    // Recalculate average
    if (newReviews.length > 0) {
      const sum = newReviews.reduce((acc, r) => acc + r.rating, 0);
      setAverageRating(sum / newReviews.length);
    } else {
      setAverageRating(0);
    }
  };

  const getRatingBreakdown = () => {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
    });
    return breakdown;
  };

  const ratingBreakdown = getRatingBreakdown();

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  const isCustomer = userRole === 'CUSTOMER';
  const canAddReview = isCustomer && !userReview;

  return (
    <div className="space-y-6" data-testid="reviews-section">
      {/* Average Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600" data-testid="average-rating">
                {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="flex items-center justify-center gap-1 my-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600" data-testid="total-reviews">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="md:col-span-2 space-y-3">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16 flex items-center gap-1">
                    {stars} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </span>
                  <Progress
                    value={totalReviews > 0 ? (ratingBreakdown[stars] / totalReviews) * 100 : 0}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-gray-600 w-8">{ratingBreakdown[stars]}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Review Form (Customer only, if not already reviewed) */}
      {canAddReview && (
        <AddReviewForm
          propertyId={propertyId}
          onReviewAdded={handleReviewAdded}
        />
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Customer Reviews ({totalReviews})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUserId={currentUserId}
                  onReviewUpdate={handleReviewUpdate}
                  onReviewDelete={handleReviewDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
