const API_URL = import.meta.env.VITE_API_URL;

export async function confirmAppointment(
  appointmentId: string,
  token: string,
) {
  const response = await fetch(
    `${API_URL}/appointments/${appointmentId}/confirm`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się potwierdzić wizyty.");
  }

  return response.json();
}

export async function completeAppointment(
  appointmentId: string,
  token: string,
) {
  const response = await fetch(
    `${API_URL}/appointments/${appointmentId}/complete`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się zakończyć treningu.");
  }

  return response.json();
}
