import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { login, googleLogin } from "../api/auth.api";
import "./LoginPage.css";

interface LoginResponse {
  token: string;
  user: {
    role: "CLIENT" | "TRAINER";
  };
  code?: string;
  message?: string;
}

function LoginPage() {
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = (await login({ email, password })) as LoginResponse;
      await saveToken(data.token);
      navigate("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Błąd logowania");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <Link to="/" className="login-card__logo">PROGREFY</Link>
          <p className="login-card__eyebrow">WITAJ PONOWNIE</p>
          <h1>Zaloguj się</h1>
          <p>Zaloguj się do swojego konta PROGREFY.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="twoj@email.pl"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Hasło"
            required
          />

          {error && <div className="login-form__error">{error}</div>}

          <button disabled={loading} type="submit">
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>

          <button type="button" onClick={googleLogin}>
            Kontynuuj z Google
          </button>
        </form>

        <p>
          Nie masz konta? <Link to="/register">Załóż konto</Link>
        </p>
      </div>
    </main>
  );
}

export default LoginPage;
