const API_URL = import.meta.env.VITE_API_URL;

export interface Review {
  id: string;
  trainerId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  appointmentId: string;
  rating: number;
  comment: string;
}

export async function getTrainerReviews(
  trainerId: string,
): Promise<Review[]> {
  const response = await fetch(
    `${API_URL}/trainers/${trainerId}/reviews`,
  );

  if (!response.ok) {
    throw new Error("Nie udało się pobrać opinii.");
  }

  return response.json();
}

export async function createReview(
  payload: CreateReviewPayload,
  token: string,
): Promise<Review> {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Nie udało się dodać opinii.");
  }

  return response.json();
}
