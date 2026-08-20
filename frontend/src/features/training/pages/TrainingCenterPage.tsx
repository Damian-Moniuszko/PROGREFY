import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getTrainingDashboard } from "../api/training.api";
import "./TrainingCenterPage.css";

export default function TrainingCenterPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    if (!token) return;

    getTrainingDashboard(token)
      .then(setDashboard)
      .catch((error) => console.error(error));
  }, [token]);

  if (!dashboard) {
    return <main className="training-center">Ładowanie...</main>;
  }

  return (
    <main className="training-center">
      <div className="training-center__container">
        <header className="training-center__header">
          <p>CENTRUM TRENINGOWE</p>
          <h1>Witaj {dashboard.user.firstName} 👋</h1>
          <span>Zarządzaj treningami i obserwuj progres.</span>
        </header>

        <nav className="training-center__tabs">
          <button onClick={() => navigate("/training-center")}>Dashboard</button>
          <button onClick={() => navigate("/training-center/plan")}>Plan treningowy</button>
          <button onClick={() => navigate("/training-center/progress")}>Progres</button>
        </nav>

        <section className="training-dashboard">
          <div className="training-card">
            <span>NAJBLIŻSZY TRENING</span>
            <h2>
              {dashboard.nextAppointment
                ? new Date(dashboard.nextAppointment.date).toLocaleString()
                : "Brak zaplanowanego treningu"}
            </h2>
          </div>

          <div className="training-card">
            <span>TWÓJ PLAN TRENINGOWY</span>
            <h2>{dashboard.currentPlan?.name ?? "Brak planu"}</h2>
          </div>
        </section>
      </div>
    </main>
  );
}
