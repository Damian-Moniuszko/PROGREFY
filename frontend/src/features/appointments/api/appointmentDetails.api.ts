const API_URL = import.meta.env.VITE_API_URL;

export interface AppointmentDetails {
  id: string;
  trainerName: string;
  clientName?: string;
  date: string;
  time: string;
  price: number;
  currency: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export async function getAppointmentById(
  appointmentId: string,
  token: string,
): Promise<AppointmentDetails> {
  const response = await fetch(
    `${API_URL}/appointments/${appointmentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się pobrać szczegółów wizyty.");
  }

  return response.json();
}
