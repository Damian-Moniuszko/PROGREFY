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

interface SetValues {
  weight: string;
  reps: string;
}

export default function WorkoutSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [session, setSession] = useState<any>(null);
  const [values, setValues] = useState<Record<number, SetValues[]>>({});
  const [savedSets, setSavedSets] = useState<Record<number, Set<number>>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkout() {
      if (!token || !id) return;

      const response = await fetch(
        `http://localhost:3000/api/training/workout/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      const data = await response.json();
      setWorkout(data);
    }

    loadWorkout();
  }, [id, token, logout, navigate]);

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

  function updateSetValue(exerciseId: number, setNumber: number, field: keyof SetValues, value: string) {
    setValues((current) => {
      const sets = [...(current[exerciseId] ?? [])];
      sets[setNumber - 1] = {
        ...(sets[setNumber - 1] ?? { weight: "", reps: "" }),
        [field]: value,
      };

      return { ...current, [exerciseId]: sets };
    });
  }

  function getSetValue(exerciseId: number, setNumber: number) {
    return values[exerciseId]?.[setNumber - 1] ?? { weight: "", reps: "" };
  }

  function isSetSaved(exerciseId: number, setNumber: number) {
    return savedSets[exerciseId]?.has(setNumber) ?? false;
  }

  async function saveSet(exerciseId: number, setNumber: number) {
    if (!token || !session) return;

    const set = getSetValue(exerciseId, setNumber);

    await fetch(`http://localhost:3000/api/training/session/${session.id}/set`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exerciseId,
        setNumber,
        weight: Number(set.weight),
        reps: Number(set.reps),
      }),
    });

    setSavedSets((current) => {
      const next = { ...current };
      next[exerciseId] = new Set(current[exerciseId] ?? []);
      next[exerciseId].add(setNumber);
      return next;
    });
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
              getSetValue={getSetValue}
              isSetSaved={isSetSaved}
              onChange={updateSetValue}
              onSave={saveSet}
            />
          ))
        )}
      </div>
    </main>
  );
}
