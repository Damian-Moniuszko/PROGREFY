import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AccountForm from "../components/AccountForm";
import PasswordForm from "../components/PasswordForm";
import AvatarUpload from "../components/AvatarUpload";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <main className="settings-page">Ładowanie...</main>;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="settings-page">
      <div className="settings-page__container">
        <header className="settings-page__header">
          <p>USTAWIENIA</p>
          <h1>Ustawienia konta</h1>
          <span>Zarządzaj swoimi danymi i bezpieczeństwem konta.</span>
        </header>

        <section className="settings-section">
          <h2>Zdjęcie profilowe</h2>
          <AvatarUpload token={token} />
        </section>

        <section className="settings-section">
          <h2>Dane konta</h2>
          <AccountForm token={token} user={user} />
        </section>

        <section className="settings-section">
          <h2>Bezpieczeństwo</h2>
          <PasswordForm token={token} />
        </section>
      </div>
    </main>
  );
}
