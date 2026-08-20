interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  notification: Notification;
  onRead?: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onRead,
}: Props) {
  return (
    <article className={notification.read ? "read" : "unread"}>
      <header>
        <strong>{notification.title}</strong>
        <span>{notification.createdAt}</span>
      </header>

      <p>{notification.message}</p>

      {!notification.read && (
        <button
          type="button"
          onClick={() => onRead?.(notification.id)}
        >
          Oznacz jako przeczytane
        </button>
      )}
    </article>
  );
}
