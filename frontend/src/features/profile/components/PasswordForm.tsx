import { useState } from "react";
import { changePassword } from "../api/profile.api";

interface Props {
  token: string;
}

export default function PasswordForm({ token }: Props) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await changePassword(token, form);
      setMessage("Hasło zostało zmienione");
      setForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Błąd zmiany hasła");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <input
        type="password"
        value={form.currentPassword}
        onChange={(e) =>
          setForm({ ...form, currentPassword: e.target.value })
        }
        placeholder="Aktualne hasło"
      />

      <input
        type="password"
        value={form.newPassword}
        onChange={(e) =>
          setForm({ ...form, newPassword: e.target.value })
        }
        placeholder="Nowe hasło"
      />

      <button type="submit">Zmień hasło</button>

      {message && <p>{message}</p>}
    </form>
  );
}
