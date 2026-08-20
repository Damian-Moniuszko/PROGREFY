import ReviewCard from "./ReviewCard";
import type { Review } from "../api/review.api";

interface Props {
  reviews: Review[];
}

export default function ReviewList({ reviews }: Props) {
  return (
    <section className="review-list">
      <header>
        <p>OPINIE</p>
        <h2>Opinie klientów</h2>
      </header>

      {reviews.length === 0 ? (
        <p>Brak opinii dla tego trenera.</p>
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ))}
        </div>
      )}
    </section>
  );
}
