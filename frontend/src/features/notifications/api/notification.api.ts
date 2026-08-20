const API_URL = import.meta.env.VITE_API_URL;

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(
  token: string,
): Promise<Notification[]> {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nie udało się pobrać powiadomień.");
  }

  return response.json();
}

export async function markAsRead(
  id: string,
  token: string,
) {
  const response = await fetch(
    `${API_URL}/notifications/${id}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się oznaczyć powiadomienia.");
  }

  return response.json();
}

export async function markAllAsRead(token: string) {
  const response = await fetch(
    `${API_URL}/notifications/read-all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się oznaczyć powiadomień.");
  }

  return response.json();
}
