import { useState } from "react";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import { createAppointment, TimeSlot } from "../api/appointment.api";
import { useAuth } from "../../../context/AuthContext";

interface Props {
  trainerId: string;
  slots: TimeSlot[];
}

export default function BookingPage({ trainerId, slots }: Props) {
  const { token } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState("");

  async function handleBooking() {
    if (!selectedSlot || !token) return;

    try {
      await createAppointment(
        {
          trainerId,
          slotId: selectedSlot.id,
        },
        token,
      );

      setMessage("Trening został zarezerwowany.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się utworzyć rezerwacji.",
      );
    }
  }

  return (
    <main className="booking-page">
      <div className="booking-page__container">
        <header>
          <p>REZERWACJA TRENINGU</p>
          <h1>Wybierz termin</h1>
        </header>

        <AvailabilityCalendar
          slots={slots}
          selectedSlot={selectedSlot}
          onSelect={setSelectedSlot}
        />

        <button
          type="button"
          disabled={!selectedSlot}
          onClick={handleBooking}
        >
          Potwierdź rezerwację
        </button>

        {message && <p>{message}</p>}
      </div>
    </main>
  );
}
