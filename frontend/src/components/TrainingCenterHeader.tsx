import { useNavigate, useLocation } from "react-router-dom";

interface Props {
  firstName?: string;
}

export default function TrainingCenterHeader({ firstName }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const isPlan = location.pathname.includes("/training-center/plan");
  const isProgress = location.pathname.includes("/training-center/progress");

  return (
    <>
      <header className="training-center__header">
        <p className="training-center__eyebrow">
          CENTRUM TRENINGOWE
        </p>

        <h1>Witaj {firstName ?? ""} 👋</h1>

        <p>
          Zarządzaj treningami, planami i obserwuj swój progres.
        </p>
      </header>

      <nav className="training-center__tabs">
        <button
          className={`training-center__tab ${
            !isPlan && !isProgress ? "training-center__tab--active" : ""
          }`}
          onClick={() => navigate("/training-center")}
        >
          Dashboard
        </button>

        <button
          className={`training-center__tab ${isPlan ? "training-center__tab--active" : ""}`}
          onClick={() => navigate("/training-center/plan")}
        >
          Plan treningowy
        </button>

        <button className="training-center__tab">Dieta</button>
        <button
          className={`training-center__tab ${
            isProgress ? "training-center__tab--active" : ""
          }`}
          onClick={() => navigate("/training-center/progress")}
        >
          Progres
        </button>
      </nav>
    </>
  );
}
