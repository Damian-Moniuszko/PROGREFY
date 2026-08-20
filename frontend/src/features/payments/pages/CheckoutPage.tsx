import PaymentButton from "../components/PaymentButton";
import PaymentStatus from "../components/PaymentStatus";
import type { Payment } from "../api/payment.api";

interface Props {
  appointmentId: string;
  payment?: Payment;
  trainerName: string;
  date: string;
  price: number;
  currency: string;
}

export default function CheckoutPage({
  appointmentId,
  payment,
  trainerName,
  date,
  price,
  currency,
}: Props) {
  return (
    <main className="checkout-page">
      <div className="checkout-page__container">
        <header>
          <p>PŁATNOŚĆ</p>
          <h1>Podsumowanie treningu</h1>
        </header>

        <section>
          <p>Trener: {trainerName}</p>
          <p>Termin: {date}</p>
          <p>
            Cena: {price} {currency}
          </p>
        </section>

        {!payment ? (
          <PaymentButton appointmentId={appointmentId} />
        ) : (
          <PaymentStatus payment={payment} />
        )}
      </div>
    </main>
  );
}
