import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TrainingCenterHeader from "../components/TrainingCenterHeader";
import "./TrainingPlanPage.css";

interface Exercise {
  id: number;
  exercise: {
    name: string;
    muscleGroup: string | null;
  };
  sets: number;
  reps: string;
}

interface Workout {
  id: number;
  name: string;
  dayOfWeek: string | null;
  exercises: Exercise[];
}

interface TrainingPlan {
  id: number;
  name: string;
  description: string | null;
  durationWeeks: number | null;
  workouts: Workout[];
}

interface DashboardData {
  user: {
    firstName: string;
  };
  currentPlan: TrainingPlan | null;
}

export default function TrainingPlanPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function loadPlan() {
      if (!token) return;

      const response = await fetch(
        "http://localhost:3000/api/training/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setDashboard(data);
    }

    loadPlan();
  }, [token]);

  const plan = dashboard?.currentPlan;

  return (
    <main className="training-center">
      <div className="training-center__container">

        <TrainingCenterHeader firstName={dashboard?.user.firstName} />

        {!plan ? (
          <h2>Brak planu treningowego</h2>
        ) : (
          <>
            <div className="plan-header">
              <span>PLAN TRENINGOWY</span>
              <h1>{plan.name}</h1>
              <p>{plan.description}</p>

              {plan.durationWeeks && (
                <p>
                  Czas trwania: {plan.durationWeeks} tygodni
                </p>
              )}
            </div>

            <div className="workouts">
              {plan.workouts.map((workout) => (
                <div className="workout-card" key={workout.id}>

                  <div className="workout-title">
                    <div>
                      <span>{workout.dayOfWeek}</span>
                      <h2>{workout.name}</h2>
                    </div>

                    <button
                      className="workout-start-button"
                      onClick={() =>
                        navigate(`/training-center/workout/${workout.id}`)
                      }
                    >
                      Rozpocznij trening
                    </button>
                  </div>

                  {workout.exercises.map((item) => (
                    <div className="exercise" key={item.id}>
                      <div>
                        <strong>{item.exercise.name}</strong>
                        <p>{item.exercise.muscleGroup}</p>
                      </div>

                      <span>
                        {item.sets} serie × {item.reps}
                      </span>
                    </div>
                  ))}

                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </main>
  );
}
