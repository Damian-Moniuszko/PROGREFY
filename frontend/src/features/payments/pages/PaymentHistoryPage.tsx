import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getPaymentHistory, Payment } from "../api/payment.api";
import PaymentStatus from "../components/PaymentStatus";

export default function PaymentHistoryPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!token) return;

    async function loadPayments() {
      try {
        const data = await getPaymentHistory(token);
        setPayments(Array.isArray(data) ? data : []);
      } catch {
        setPayments([]);
      }
    }

    loadPayments();
  }, [token]);

  return (
    <main className="payment-history-page">
      <div className="payment-history-page__container">
        <header>
          <p>PŁATNOŚCI</p>
          <h1>Historia płatności</h1>
        </header>

        {payments.length === 0 ? (
          <p>Brak płatności.</p>
        ) : (
          <div>
            {payments.map((payment) => (
              <PaymentStatus
                key={payment.id}
                payment={payment}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
