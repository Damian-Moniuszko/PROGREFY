import { useState } from "react";
import { updateAccount } from "../api/profile.api";

interface Props {
  token: string;
  user: any;
}

export default function AccountForm({ token, user }: Props) {
  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
  });

  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await updateAccount(token, form);
      setMessage("Dane zostały zapisane");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Błąd zapisu");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="account-form">
      <input
        value={form.firstName}
        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        placeholder="Imię"
      />

      <input
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        placeholder="Nazwisko"
      />

      <input
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Email"
      />

      <button type="submit">Zapisz dane</button>

      {message && <p>{message}</p>}
    </form>
  );
}
