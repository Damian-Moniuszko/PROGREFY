const API_URL = import.meta.env.VITE_API_URL;

export interface NotificationEventPayload {
  userId: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "training" | "system";
}

export async function createNotificationEvent(
  payload: NotificationEventPayload,
  token: string,
) {
  const response = await fetch(`${API_URL}/notifications/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Nie udało się utworzyć powiadomienia.");
  }

  return response.json();
}
