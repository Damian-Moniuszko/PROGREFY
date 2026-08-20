import { useState } from "react";

interface Props {
  onSubmit: (rating: number, comment: string) => void;
  loading?: boolean;
  error?: string;
}

export default function ReviewForm({
  onSubmit,
  loading = false,
  error,
}: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  function handleSubmit() {
    onSubmit(rating, comment);
  }

  return (
    <section className="review-form">
      <h2>Dodaj opinię</h2>

      <label>
        Ocena
        <select
          value={rating}
          onChange={(event) =>
            setRating(Number(event.target.value))
          }
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} ⭐
            </option>
          ))}
        </select>
      </label>

      <label>
        Komentarz
        <textarea
          value={comment}
          onChange={(event) =>
            setComment(event.target.value)
          }
          placeholder="Napisz swoją opinię..."
        />
      </label>

      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? "Dodawanie..." : "Dodaj opinię"}
      </button>

      {error && <p>{error}</p>}
    </section>
  );
}
