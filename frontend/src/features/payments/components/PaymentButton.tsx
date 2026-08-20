import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { createPayment } from "../api/payment.api";

interface Props {
  appointmentId: string;
  onSuccess?: () => void;
}

export default function PaymentButton({ appointmentId, onSuccess }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handlePayment() {
    if (!token) return;

    try {
      setLoading(true);

      const payment = await createPayment(
        {
          appointmentId,
        },
        token,
      );

      setMessage(
        `Płatność utworzona: ${payment.status}`,
      );

      onSuccess?.();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się rozpocząć płatności.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="payment-button">
      <button
        type="button"
        disabled={loading}
        onClick={handlePayment}
      >
        {loading ? "Przetwarzanie..." : "💳 Zapłać teraz"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
