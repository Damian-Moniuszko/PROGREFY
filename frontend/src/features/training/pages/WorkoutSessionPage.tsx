import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import WorkoutHeader from "../components/WorkoutHeader";
import WorkoutSummary from "../components/WorkoutSummary";
import ExerciseSessionCard from "../components/ExerciseSessionCard";
import "./WorkoutSessionPage.css";

interface Workout {
  id: number;
  name: string;
  dayOfWeek: string | null;
  exercises: any[];
}

export default function WorkoutSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!token || !id) return;

      const response = await fetch(
        `http://localhost:3000/api/training/workout/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Nie udało się pobrać treningu");
        return;
      }

      setWorkout(data);
    }

    load();
  }, [id, token]);

  async function startWorkout() {
    if (!token || !workout) return;

    const response = await fetch(
      "http://localhost:3000/api/training/session/start",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workoutId: workout.id }),
      }
    );

    const data = await response.json();
    setSession(data.session);
  }

  if (!workout) {
    return <main className="workout-session">Ładowanie...</main>;
  }

  return (
    <main className="workout-session">
      <div className="workout-session__container">
        <WorkoutHeader
          name={workout.name}
          dayOfWeek={workout.dayOfWeek}
          started={Boolean(session)}
          onStart={startWorkout}
          onFinish={() => navigate("/training-center")}
        />

        {error && <div className="workout-error">{error}</div>}

        {!session ? (
          <WorkoutSummary exercisesCount={workout.exercises.length} />
        ) : (
          workout.exercises.map((exercise, index) => (
            <ExerciseSessionCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              getSetValue={() => ({ weight: "", reps: "" })}
              isSetSaved={() => false}
              onChange={() => undefined}
              onSave={() => undefined}
            />
          ))
        )}
      </div>
    </main>
  );
}
