import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import type { Review } from "../api/review.api";

interface Props {
  reviews: Review[];
  canReview?: boolean;
  onSubmit: (rating: number, comment: string) => void;
  loading?: boolean;
  error?: string;
}

export default function ReviewSection({
  reviews,
  canReview = false,
  onSubmit,
  loading,
  error,
}: Props) {
  return (
    <section className="review-section">
      <ReviewList reviews={reviews} />

      {canReview && (
        <ReviewForm
          onSubmit={onSubmit}
          loading={loading}
          error={error}
        />
      )}
    </section>
  );
}
