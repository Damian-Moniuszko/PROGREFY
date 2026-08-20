const API_URL = import.meta.env.VITE_API_URL;

export type NotificationType =
  | "booking"
  | "payment"
  | "training"
  | "system";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
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

export async function markNotificationAsRead(
  notificationId: string,
  token: string,
): Promise<Notification> {
  const response = await fetch(
    `${API_URL}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się oznaczyć powiadomienia jako przeczytane.");
  }

  return response.json();
}

export async function getUnreadCount(
  token: string,
): Promise<number> {
  const response = await fetch(
    `${API_URL}/notifications/unread-count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się pobrać liczby nieprzeczytanych powiadomień.");
  }

  const data = await response.json();

  return data.count;
}
