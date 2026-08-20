import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get("token");
    const mode = searchParams.get("mode");

    if (!token) {
      setError("Nie udało się zakończyć logowania.");
      return;
    }

    void login(token)
      .then(() => {
        navigate(mode === "connect" ? "/settings?oauth=connected" : "/profile", {
          replace: true,
        });
      })
      .catch(() => {
        setError("Nie udało się zalogować użytkownika.");
      });
  }, [login, navigate, searchParams]);

  if (error) {
    return <main>Nie udało się zalogować: {error}</main>;
  }

  return <main>Kończymy logowanie...</main>;
}
