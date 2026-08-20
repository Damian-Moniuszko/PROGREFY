const API_URL = import.meta.env.VITE_API_URL;

export interface AvailabilitySlot {
  id: string;
  day: string;
  time: string;
  active: boolean;
}

export interface CreateAvailabilityPayload {
  day: string;
  time: string;
}

export async function getTrainerAvailability(
  trainerId: string,
  token: string,
): Promise<AvailabilitySlot[]> {
  const response = await fetch(
    `${API_URL}/trainers/${trainerId}/availability`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się pobrać dostępności trenera.");
  }

  return response.json();
}

export async function createAvailabilitySlot(
  payload: CreateAvailabilityPayload,
  token: string,
) {
  const response = await fetch(`${API_URL}/availability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Nie udało się dodać dostępności.");
  }

  return response.json();
}

export async function updateAvailabilitySlot(
  id: string,
  payload: Partial<CreateAvailabilityPayload>,
  token: string,
) {
  const response = await fetch(`${API_URL}/availability/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Nie udało się zaktualizować dostępności.");
  }

  return response.json();
}

export async function deleteAvailabilitySlot(
  id: string,
  token: string,
) {
  const response = await fetch(`${API_URL}/availability/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nie udało się usunąć dostępności.");
  }

  return response.json();
}
