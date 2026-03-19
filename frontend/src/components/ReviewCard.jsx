import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { reviewService } from '@/services/reviewService';

export const ReviewCard = ({ review, currentUserId, onReviewUpdate, onReviewDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [loading, setLoading] = useState(false);

  const isOwner = currentUserId === review.user._id;

  const handleUpdate = async () => {
    if (!editComment.trim()) {
      toast.error('Comment is required');
      return;
    }

    setLoading(true);
    try {
      const response = await reviewService.updateReview(review._id, {
        rating: editRating,
        comment: editComment
      });
      toast.success('Review updated successfully');
      onReviewUpdate(response.review);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setLoading(true);
    try {
      await reviewService.deleteReview(review._id);
      toast.success('Review deleted successfully');
      onReviewDelete(review._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="border-b border-gray-200 pb-4 last:border-0" data-testid={`review-card-${review._id}`}>
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <StarRating rating={editRating} onRatingChange={setEditRating} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
            <Textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={3}
              placeholder="Share your experience..."
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="save-review-btn"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditRating(review.rating);
                setEditComment(review.comment);
              }}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
              </div>
              <StarRating rating={review.rating} readonly size="sm" />
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  data-testid="edit-review-btn"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  data-testid="delete-review-btn"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
        </>
      )}
    </div>
  );
};
