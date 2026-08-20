const API_URL = import.meta.env.VITE_API_URL;

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface CreatePaymentPayload {
  appointmentId: string;
}

export async function createPayment(
  payload: CreatePaymentPayload,
  token: string,
): Promise<Payment> {
  const response = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Nie udało się rozpocząć płatności.");
  }

  return response.json();
}

export async function getPaymentStatus(
  paymentId: string,
  token: string,
): Promise<Payment> {
  const response = await fetch(
    `${API_URL}/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Nie udało się pobrać statusu płatności.");
  }

  return response.json();
}

export async function getPaymentHistory(
  token: string,
): Promise<Payment[]> {
  const response = await fetch(`${API_URL}/payments/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nie udało się pobrać historii płatności.");
  }

  return response.json();
}
