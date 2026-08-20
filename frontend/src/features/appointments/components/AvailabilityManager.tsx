interface AvailabilitySlot {
  id: string;
  day: string;
  time: string;
  active: boolean;
}

interface Props {
  slots: AvailabilitySlot[];
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  onToggle?: (id: string) => void;
}

export default function AvailabilityManager({
  slots,
  onAdd,
  onRemove,
  onToggle,
}: Props) {
  return (
    <section className="availability-manager">
      <header>
        <p>GRAFIK TRENERA</p>
        <h2>Moja dostępność</h2>
      </header>

      <button type="button" onClick={onAdd}>
        + Dodaj godzinę
      </button>

      {slots.length === 0 ? (
        <p>Brak ustawionej dostępności.</p>
      ) : (
        <div className="availability-manager__list">
          {slots.map((slot) => (
            <article key={slot.id}>
              <div>
                <strong>{slot.day}</strong>
                <span>{slot.time}</span>
              </div>

              <button
                type="button"
                onClick={() => onToggle?.(slot.id)}
              >
                {slot.active ? "Aktywne" : "Nieaktywne"}
              </button>

              <button
                type="button"
                onClick={() => onRemove?.(slot.id)}
              >
                Usuń
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
