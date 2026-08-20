import type { Payment } from "../api/payment.api";

interface Props {
  payment: Payment;
}

const statusLabels = {
  pending: "Oczekuje",
  paid: "Opłacona",
  failed: "Nieudana",
  refunded: "Zwrócona",
};

export default function PaymentStatus({ payment }: Props) {
  return (
    <section className="payment-status">
      <header>
        <p>PŁATNOŚĆ</p>
        <h2>Status płatności</h2>
      </header>

      <p>
        Status: {statusLabels[payment.status]}
      </p>

      <p>
        Kwota: {payment.amount} {payment.currency}
      </p>

      <p>
        Data: {payment.createdAt}
      </p>
    </section>
  );
}
