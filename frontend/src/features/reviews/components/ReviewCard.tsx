import type { Review } from "../api/review.api";

interface Props {
  review: Review;
}

export default function ReviewCard({ review }: Props) {
  return (
    <article className="review-card">
      <header>
        <strong>{review.clientName}</strong>
        <span>{review.createdAt}</span>
      </header>

      <p>
        {"⭐".repeat(review.rating)}
      </p>

      <p>{review.comment}</p>
    </article>
  );
}
