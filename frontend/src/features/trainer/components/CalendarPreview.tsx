interface TrainingEvent {
  id?: string;
  clientName?: string;
  time?: string;
  status?: string;
}

interface Props {
  events: TrainingEvent[];
}

export default function CalendarPreview({ events }: Props) {
  return (
    <section className="calendar-preview">
      <header className="calendar-preview__header">
        <h2>Dzisiejszy grafik</h2>
        <span>{events.length} treningów</span>
      </header>

      {events.length === 0 ? (
        <p>Brak zaplanowanych treningów.</p>
      ) : (
        <div className="calendar-preview__list">
          {events.map((event) => (
            <article key={event.id ?? `${event.time}-${event.clientName}`}>
              <strong>{event.time ?? "--:--"}</strong>
              <span>{event.clientName ?? "Klient"}</span>
              {event.status && <small>{event.status}</small>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
