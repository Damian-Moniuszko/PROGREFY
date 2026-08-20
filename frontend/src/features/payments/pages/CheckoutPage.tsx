import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getAppointmentById } from "../../appointments/api/appointmentDetails.api";
import PaymentButton from "../components/PaymentButton";
import PaymentStatus from "../components/PaymentStatus";
import type { Payment } from "../api/payment.api";

export default function CheckoutPage() {
  const { appointmentId } = useParams();
  const { token } = useAuth();

  const [payment, setPayment] = useState<Payment>();
  const [appointment, setAppointment] = useState<any>();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!appointmentId || !token) return;

    async function loadAppointment() {
      try {
        const data = await getAppointmentById(
          appointmentId,
          token,
        );

        setAppointment(data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać wizyty.",
        );
      }
    }

    loadAppointment();
  }, [appointmentId, token]);

  if (!appointment) {
    return <p>{message || "Ładowanie danych treningu..."}</p>;
  }

  return (
    <main className="checkout-page">
      <div className="checkout-page__container">
        <header>
          <p>PŁATNOŚĆ</p>
          <h1>Podsumowanie treningu</h1>
        </header>

        <section>
          <p>Trener: {appointment.trainerName}</p>
          <p>
            Termin: {appointment.date} {appointment.time}
          </p>
          <p>
            Cena: {appointment.price} {appointment.currency}
          </p>
        </section>

        {!payment ? (
          <PaymentButton appointmentId={appointment.id} />
        ) : (
          <PaymentStatus payment={payment} />
        )}
      </div>
    </main>
  );
}
