import AppointmentActions from "./AppointmentActions";

interface Appointment {
  id: string;
  date: string;
  time: string;
  clientName?: string;
  trainerName?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface Props {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const statusLabels = {
  pending: "Oczekuje",
  confirmed: "Potwierdzona",
  completed: "Zakończona",
  cancelled: "Anulowana",
};

export default function AppointmentCard({
  appointment,
  onCancel,
  onConfirm,
  onComplete,
}: Props) {
  return (
    <article className="appointment-card">
      <header>
        <strong>{appointment.date}</strong>
        <span>{appointment.time}</span>
      </header>

      {appointment.clientName && <p>Klient: {appointment.clientName}</p>}
      {appointment.trainerName && <p>Trener: {appointment.trainerName}</p>}

      <p>Status: {statusLabels[appointment.status]}</p>

      <AppointmentActions
        status={appointment.status}
        onConfirm={() => onConfirm?.(appointment.id)}
        onComplete={() => onComplete?.(appointment.id)}
        onCancel={() => onCancel?.(appointment.id)}
      />
    </article>
  );
}
