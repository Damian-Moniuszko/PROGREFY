import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, googleLogin } from "../api/auth.api";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        role: "CLIENT",
      });

      navigate(`/verify-email?pending=${encodeURIComponent(email)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Błąd rejestracji");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <div className="register-card">
        <div className="register-card__header">
          <Link to="/" className="register-card__logo">PROGREFY</Link>
          <p className="register-card__eyebrow">DOŁĄCZ DO PROGREFY</p>
          <h1>Utwórz konto</h1>
          <p>Zacznij korzystać z PROGREFY i znajdź swojego trenera.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Imię" required />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nazwisko" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="twoj@email.pl" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 znaków" minLength={8} required />

          {error && <div className="register-form__error">{error}</div>}

          <button disabled={loading} type="submit">
            {loading ? "Tworzenie konta..." : "Utwórz konto"}
          </button>

          <button type="button" onClick={googleLogin}>
            Kontynuuj z Google
          </button>
        </form>

        <p>
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </p>
      </div>
    </main>
  );
}
