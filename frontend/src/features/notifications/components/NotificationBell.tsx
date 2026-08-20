import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getNotifications,
  markAsRead,
} from "../api/notification.api";
import NotificationList from "./NotificationList";
import type { Notification } from "../api/notification.api";

export default function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function loadNotifications() {
      try {
        const data = await getNotifications(token);
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      }
    }

    loadNotifications();
  }, [token]);

  async function handleRead(id: string) {
    if (!token) return;

    await markAsRead(id, token);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div className="notification-bell">
      <button
        type="button"
        aria-label="Powiadomienia"
        onClick={() => setOpen((current) => !current)}
      >
        🔔
        {unreadCount > 0 && <span>{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-bell__panel">
          <NotificationList
            notifications={notifications}
            onRead={handleRead}
          />
        </div>
      )}
    </div>
  );
}
