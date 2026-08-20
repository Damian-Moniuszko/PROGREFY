interface Props {
  status: "pending" | "confirmed" | "completed" | "cancelled";
  onConfirm?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function AppointmentActions({
  status,
  onConfirm,
  onComplete,
  onCancel,
}: Props) {
  return (
    <div className="appointment-actions">
      {status === "pending" && (
        <button type="button" onClick={onConfirm}>
          Potwierdź wizytę
        </button>
      )}

      {status === "confirmed" && (
        <button type="button" onClick={onComplete}>
          Zakończ trening
        </button>
      )}

      {status !== "cancelled" && (
        <button type="button" onClick={onCancel}>
          Anuluj
        </button>
      )}
    </div>
  );
}
