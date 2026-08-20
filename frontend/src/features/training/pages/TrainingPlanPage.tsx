import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import TrainingPlanHeader from "../components/TrainingPlanHeader";
import WorkoutDayCard from "../components/WorkoutDayCard";
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

      setDashboard(await response.json());
    }

    loadPlan();
  }, [token]);

  const plan = dashboard?.currentPlan;

  return (
    <main className="training-center">
      <div className="training-center__container">
        {!plan ? (
          <h2>Brak planu treningowego</h2>
        ) : (
          <>
            <TrainingPlanHeader
              name={plan.name}
              description={plan.description}
              durationWeeks={plan.durationWeeks}
            />

            <div className="workouts">
              {plan.workouts.map((workout) => (
                <WorkoutDayCard
                  key={workout.id}
                  workout={workout}
                  onStart={() => navigate(`/training-center/workout/${workout.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
