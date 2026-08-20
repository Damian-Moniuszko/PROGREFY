import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import WorkoutHeader from "../components/WorkoutHeader";
import WorkoutSummary from "../components/WorkoutSummary";
import ExerciseSessionCard from "../components/ExerciseSessionCard";
import { getWorkout, saveWorkoutSet, startWorkout } from "../api/training.api";
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

      try {
        const data = await getWorkout(id, token);
        setWorkout(data as Workout);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Błąd treningu");
      }
    }

    loadWorkout();
  }, [id, token]);

  async function handleStartWorkout() {
    if (!token || !workout) return;

    try {
      const data = await startWorkout(workout.id, token);
      setSession((data as any).session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd startu treningu");
    }
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

    try {
      await saveWorkoutSet(
        session.id,
        {
          exerciseId,
          setNumber,
          weight: Number(set.weight),
          reps: Number(set.reps),
        },
        token
      );

      setSavedSets((current) => {
        const next = { ...current };
        next[exerciseId] = new Set(current[exerciseId] ?? []);
        next[exerciseId].add(setNumber);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie zapisano serii");
    }
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
          onStart={handleStartWorkout}
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
