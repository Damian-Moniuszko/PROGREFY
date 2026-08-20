import { useState } from "react";
import { createTrainingPlan, updateTrainingPlan } from "../api/trainer.api";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes: string;
}

interface TrainingDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface Props {
  token: string;
  clientId: string;
  initialPlan?: TrainingDay[];
}

const createExercise = (): Exercise => ({
  id: crypto.randomUUID(),
  name: "",
  sets: 3,
  reps: "8-12",
  weight: "",
  notes: "",
});

const createDay = (): TrainingDay => ({
  id: crypto.randomUUID(),
  name: "Nowy trening",
  exercises: [createExercise()],
});

export default function TrainingPlanEditor({
  token,
  clientId,
  initialPlan = [],
}: Props) {
  const [days, setDays] = useState<TrainingDay[]>(
    initialPlan.length ? initialPlan : [createDay()],
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateDay(dayId: string, patch: Partial<TrainingDay>) {
    setDays((current) =>
      current.map((day) => (day.id === dayId ? { ...day, ...patch } : day)),
    );
  }

  function updateExercise(
    dayId: string,
    exerciseId: string,
    patch: Partial<Exercise>,
  ) {
    setDays((current) =>
      current.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((exercise) =>
                exercise.id === exerciseId
                  ? { ...exercise, ...patch }
                  : exercise,
              ),
            }
          : day,
      ),
    );
  }

  function addDay() {
    setDays((current) => [...current, createDay()]);
  }

  function addExercise(dayId: string) {
    setDays((current) =>
      current.map((day) =>
        day.id === dayId
          ? { ...day, exercises: [...day.exercises, createExercise()] }
          : day,
      ),
    );
  }

  function removeDay(dayId: string) {
    setDays((current) => current.filter((day) => day.id !== dayId));
  }

  function removeExercise(dayId: string, exerciseId: string) {
    setDays((current) =>
      current.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.filter(
                (exercise) => exercise.id !== exerciseId,
              ),
            }
          : day,
      ),
    );
  }

  async function savePlan() {
    setSaving(true);
    setMessage("");

    try {
      const payload = { clientId, days };
      await (initialPlan.length
        ? updateTrainingPlan(token, clientId, payload)
        : createTrainingPlan(token, clientId, payload));
      setMessage("Plan treningowy został zapisany.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się zapisać planu treningowego.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="training-plan-editor">
      <header>
        <div>
          <p>PLAN TRENINGOWY</p>
          <h2>Edytor planu</h2>
        </div>
        <button type="button" onClick={addDay}>
          + Dodaj trening
        </button>
      </header>

      {days.map((day, dayIndex) => (
        <article className="training-plan-day" key={day.id}>
          <div className="training-plan-day__header">
            <input
              value={day.name}
              onChange={(event) =>
                updateDay(day.id, { name: event.target.value })
              }
              placeholder={`Trening ${dayIndex + 1}`}
            />
            <button type="button" onClick={() => removeDay(day.id)}>
              Usuń trening
            </button>
          </div>

          {day.exercises.map((exercise) => (
            <div className="training-plan-exercise" key={exercise.id}>
              <input
                value={exercise.name}
                onChange={(event) =>
                  updateExercise(day.id, exercise.id, {
                    name: event.target.value,
                  })
                }
                placeholder="Nazwa ćwiczenia"
              />
              <input
                type="number"
                min="1"
                value={exercise.sets}
                onChange={(event) =>
                  updateExercise(day.id, exercise.id, {
                    sets: Number(event.target.value),
                  })
                }
                placeholder="Serie"
              />
              <input
                value={exercise.reps}
                onChange={(event) =>
                  updateExercise(day.id, exercise.id, {
                    reps: event.target.value,
                  })
                }
                placeholder="Powtórzenia"
              />
              <input
                value={exercise.weight}
                onChange={(event) =>
                  updateExercise(day.id, exercise.id, {
                    weight: event.target.value,
                  })
                }
                placeholder="Ciężar"
              />
              <input
                value={exercise.notes}
                onChange={(event) =>
                  updateExercise(day.id, exercise.id, {
                    notes: event.target.value,
                  })
                }
                placeholder="Notatka"
              />
              <button
                type="button"
                onClick={() => removeExercise(day.id, exercise.id)}
              >
                Usuń
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addExercise(day.id)}>
            + Dodaj ćwiczenie
          </button>
        </article>
      ))}

      <footer>
        <button type="button" disabled={saving} onClick={savePlan}>
          {saving ? "Zapisywanie..." : "Zapisz plan"}
        </button>
        {message && <p>{message}</p>}
      </footer>
    </section>
  );
}
