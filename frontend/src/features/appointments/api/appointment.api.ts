const API_URL = import.meta.env.VITE_API_URL;

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface AppointmentPayload {
  trainerId: string;
  slotId: string;
  note?: string;
}

export async function getAvailableSlots(
  trainerId: string,
  token: string,
): Promise<TimeSlot[]> {
  const response = await fetch(
    `${API_URL}/trainers/${trainerId}/availability`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się pobrać dostępnych terminów.");
  }

  return response.json();
}

export async function createAppointment(
  payload: AppointmentPayload,
  token: string,
) {
  const response = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Nie udało się utworzyć rezerwacji.");
  }

  return response.json();
}

export async function getAppointments(token: string) {
  const response = await fetch(`${API_URL}/appointments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nie udało się pobrać wizyt.");
  }

  return response.json();
}

export async function cancelAppointment(
  appointmentId: string,
  token: string,
) {
  const response = await fetch(
    `${API_URL}/appointments/${appointmentId}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się anulować wizyty.");
  }

  return response.json();
}
