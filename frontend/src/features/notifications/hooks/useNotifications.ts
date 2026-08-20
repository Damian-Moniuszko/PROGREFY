import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  type Notification,
} from "../api/notification.api";

export function useNotifications() {
  const { token } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function loadNotifications() {
    if (!token) return;

    try {
      setLoading(true);

      const [items, count] = await Promise.all([
        getNotifications(token),
        getUnreadCount(token),
      ]);

      setNotifications(items);
      setUnreadCount(count);
    } finally {
      setLoading(false);
    }
  }

  async function readNotification(id: string) {
    if (!token) return;

    const updated = await markNotificationAsRead(id, token);

    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? updated : item,
      ),
    );

    setUnreadCount((current) =>
      updated.read && current > 0
        ? current - 1
        : current,
    );
  }

  useEffect(() => {
    loadNotifications();
  }, [token]);

  return {
    notifications,
    unreadCount,
    loading,
    reload: loadNotifications,
    readNotification,
  };
}
