interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

interface Props {
  slots: TimeSlot[];
  selectedSlot?: TimeSlot | null;
  onSelect?: (slot: TimeSlot) => void;
}

export default function AvailabilityCalendar({
  slots,
  selectedSlot,
  onSelect,
}: Props) {
  return (
    <section className="availability-calendar">
      <header>
        <p>DOSTĘPNOŚĆ TRENERA</p>
        <h2>Wybierz termin treningu</h2>
      </header>

      {slots.length === 0 ? (
        <p>Brak dostępnych terminów.</p>
      ) : (
        <div className="availability-calendar__slots">
          {slots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              disabled={!slot.available}
              className={
                selectedSlot?.id === slot.id ? "selected" : ""
              }
              onClick={() => onSelect?.(slot)}
            >
              <strong>{slot.date}</strong>
              <span>{slot.time}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
