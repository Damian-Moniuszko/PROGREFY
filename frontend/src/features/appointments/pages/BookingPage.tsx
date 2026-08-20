import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import { createAppointment, TimeSlot } from "../api/appointment.api";
import { createNotificationEvent } from "../../notifications/api/notificationEvents.api";
import { useAuth } from "../../../context/AuthContext";

interface Props {
  trainerId: string;
  slots: TimeSlot[];
}

export default function BookingPage({ trainerId, slots }: Props) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState("");

  async function handleBooking() {
    if (!selectedSlot || !token) return;

    try {
      const appointment = await createAppointment(
        {
          trainerId,
          slotId: selectedSlot.id,
        },
        token,
      );

      await createNotificationEvent(
        {
          userId: trainerId,
          title: "Nowa rezerwacja treningu",
          message: "Klient zarezerwował nowy termin treningu.",
          type: "booking",
        },
        token,
      );

      navigate(`/checkout/${appointment.id}`);
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
          Przejdź do płatności
        </button>

        {message && <p>{message}</p>}
      </div>
    </main>
  );
}
