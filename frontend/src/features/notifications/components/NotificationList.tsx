import NotificationItem from "./NotificationItem";
import type { Notification } from "../api/notification.api";

interface Props {
  notifications: Notification[];
  onRead?: (id: string) => void;
}

export default function NotificationList({
  notifications,
  onRead,
}: Props) {
  return (
    <section className="notification-list">
      <header>
        <p>POWIADOMIENIA</p>
        <h2>Twoje alerty</h2>
      </header>

      {notifications.length === 0 ? (
        <p>Brak powiadomień.</p>
      ) : (
        <div>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={onRead}
            />
          ))}
        </div>
      )}
    </section>
  );
}
