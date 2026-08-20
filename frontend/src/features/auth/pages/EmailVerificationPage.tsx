import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { verifyEmail } from "../api/auth.api";
import "./EmailVerificationPage.css";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const token = searchParams.get("token");
  const pending = searchParams.get("pending");

  const [status, setStatus] = useState<
    "pending" | "loading" | "success" | "error"
  >(token ? "loading" : "pending");

  const [message, setMessage] = useState(
    pending
      ? "Konto zostało utworzone. Sprawdź swoją skrzynkę e-mail i kliknij link aktywacyjny."
      : ""
  );

  useEffect(() => {
    if (!token) return;

    async function confirmEmail() {
      try {
        const data = await verifyEmail(token);

        if ((data as any).token) {
          await login((data as any).token);
        }

        setStatus("success");
        setMessage((data as any).message || "E-mail został potwierdzony.");

        setTimeout(() => navigate("/"), 2000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Nie udało się potwierdzić adresu e-mail."
        );
      }
    }

    confirmEmail();
  }, [token, login, navigate]);

  return (
    <main className="email-verification-page">
      <section className="email-verification-card">
        <Link to="/" className="email-verification-logo">
          PROGREFY
        </Link>

        <div className={`email-verification-icon ${status}`}>
          {status === "loading" ? "..." : status === "success" ? "✓" : status === "pending" ? "✉" : "!"}
        </div>

        <p className="email-verification-label">WERYFIKACJA E-MAILA</p>

        <h1>
          {status === "pending"
            ? "Sprawdź swoją skrzynkę"
            : status === "loading"
              ? "Potwierdzamy adres..."
              : status === "success"
                ? "E-mail potwierdzony"
                : "Weryfikacja nieudana"}
        </h1>

        <p className="email-verification-text">{message}</p>

        {status === "error" && (
          <Link to="/register" className="email-verification-button">
            Wróć do rejestracji
          </Link>
        )}
      </section>
    </main>
  );
}
