'use client';
import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { retryAsync, handleError, handleSuccess } from '@/lib/errorHandling';

interface RatingModalProps {
  bookingId: string;
  ratedUserId: string;
  ratedUserName: string;
  raterType: 'driver' | 'passenger';
  onClose: () => void;
  onRated: () => void;
}

export default function RatingModal({
  bookingId,
  ratedUserId,
  ratedUserName,
  raterType,
  onClose,
  onRated,
}: RatingModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;

    setSubmitting(true);
    try {
      await retryAsync(async () => {
        const { error } = await supabase.from('ratings').insert({
          booking_id: bookingId,
          rater_id: user.id,
          rated_id: ratedUserId,
          rating,
          review: review.trim() || null,
          rater_type: raterType,
        });

        if (error) throw error;

        // Update the rated user's average rating
        const { data: ratings } = await supabase
          .from('ratings')
          .select('rating')
          .eq('rated_id', ratedUserId);

        if (ratings && ratings.length > 0) {
          const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
          await supabase
            .from('profiles')
            .update({ rating: Math.round(avgRating * 10) / 10 })
            .eq('id', ratedUserId);
        }
      }, {
        maxRetries: 1,
        retryDelay: 1000,
      });

      handleSuccess('Rating Submitted', `You rated ${ratedUserName} ${rating} star${rating > 1 ? 's' : ''}.`);
      onRated();
      onClose();
    } catch (error: any) {
      handleError(error, 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Rate {ratedUserName}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <p className="text-muted-foreground mb-4">
            How was your ride with {ratedUserName}?
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-warning text-warning'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        <div className="mb-6">
          <Textarea
            placeholder="Write a review (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
