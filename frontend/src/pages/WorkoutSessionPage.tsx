import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./WorkoutSessionPage.css";

interface Exercise {
  id: number;
  exerciseId: number;
  sets: number;
  reps: string;
  order: number;
  exercise: {
    id: number;
    name: string;
    muscleGroup: string | null;
    description: string | null;
  };
}

interface Workout {
  id: number;
  name: string;
  dayOfWeek: string | null;
  order: number;
  exercises: Exercise[];
}

interface WorkoutSession {
  id: number;
  clientId: number;
  workoutId: number | null;
  startedAt: string;
  finishedAt: string | null;
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
  const [session, setSession] = useState<WorkoutSession | null>(null);

  const [values, setValues] = useState<
    Record<number, SetValues[]>
  >({});

  const [savedSets, setSavedSets] = useState<
    Record<number, Set<number>>
  >({} as Record<number, Set<number>>);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkout() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/training/workout/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          logout();
          navigate("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Nie udało się pobrać treningu."
          );
        }

        setWorkout(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać treningu."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorkout();
  }, [id, token, logout, navigate]);

  async function startWorkout() {
    if (!token || !workout) {
      navigate("/login");
      return;
    }

    setStarting(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/training/session/start",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workoutId: workout.id,
          }),
        }
      );

      if (response.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Nie udało się rozpocząć treningu."
        );
      }

      setSession(data.session);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Nie udało się rozpocząć treningu."
      );
    } finally {
      setStarting(false);
    }
  }

  function updateSetValue(
    exerciseId: number,
    setNumber: number,
    field: keyof SetValues,
    value: string
  ) {
    setValues((current) => {
      const exerciseValues = [
        ...(current[exerciseId] ?? []),
      ];

      const currentSet = exerciseValues[setNumber - 1] ?? {
        weight: "",
        reps: "",
      };

      exerciseValues[setNumber - 1] = {
        ...currentSet,
        [field]: value,
      };

      return {
        ...current,
        [exerciseId]: exerciseValues,
      };
    });
  }

  function getSetValue(
    exerciseId: number,
    setNumber: number
  ): SetValues {
    return (
      values[exerciseId]?.[setNumber - 1] ?? {
        weight: "",
        reps: "",
      }
    );
  }

  function isSetSaved(
    exerciseId: number,
    setNumber: number
  ) {
    return Boolean(
      savedSets[exerciseId]?.has(setNumber)
    );
  }

  async function saveSet(
    exerciseId: number,
    setNumber: number
  ) {
    if (!token || !session) {
      return;
    }

    const set = getSetValue(exerciseId, setNumber);

    const weight = Number(set.weight);
    const reps = Number(set.reps);

    if (
      !Number.isFinite(weight) ||
      weight < 0 ||
      !Number.isInteger(reps) ||
      reps < 1
    ) {
      setError(
        "Wpisz poprawny ciężar i liczbę powtórzeń."
      );
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/training/session/${session.id}/set`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exerciseId,
            setNumber,
            weight,
            reps,
          }),
        }
      );

      if (response.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Nie udało się zapisać serii."
        );
      }

      setSavedSets((current) => {
        const next = {
          ...current,
        };

        const setNumbers = new Set(
          current[exerciseId] ?? []
        );

        setNumbers.add(setNumber);
        next[exerciseId] = setNumbers;

        return next;
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Nie udało się zapisać serii."
      );
    }
  }

  async function endWorkout() {
    if (!token || !session) {
      return;
    }

    const hasUnsavedSets = workout?.exercises.some(
      (exercise) => {
        const saved = savedSets[exercise.exerciseId]?.size ?? 0;

        return saved > 0 && saved < exercise.sets;
      }
    );

    if (hasUnsavedSets) {
      const confirmed = window.confirm(
        "Nie wszystkie zapisane serie zostały uzupełnione. Czy na pewno chcesz zakończyć trening?"
      );

      if (!confirmed) {
        return;
      }
    }

    setEnding(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/training/session/${session.id}/end`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Nie udało się zakończyć treningu."
        );
      }

      setSession(data.session);

      window.setTimeout(() => {
        navigate("/training-center");
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Nie udało się zakończyć treningu."
      );
    } finally {
      setEnding(false);
    }
  }

  if (loading) {
    return (
      <main className="workout-session">
        <div className="workout-session__container">
          <p>Ładowanie treningu...</p>
        </div>
      </main>
    );
  }

  if (error && !workout) {
    return (
      <main className="workout-session">
        <div className="workout-session__container">
          <div className="workout-error">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!workout) {
    return null;
  }

  return (
    <main className="workout-session">
      <div className="workout-session__container">
        <p className="workout-session__eyebrow">
          AKTYWNY TRENING
        </p>

        <div className="workout-session__top">
          <div>
            <h1>{workout.name}</h1>

            <p>
              {workout.dayOfWeek
                ? workout.dayOfWeek
                : "Trening"}
            </p>
          </div>

          {!session ? (
            <button
              className="workout-session__start"
              disabled={starting}
              onClick={startWorkout}
            >
              {starting
                ? "Rozpoczynanie..."
                : "Rozpocznij trening"}
            </button>
          ) : (
            <button
              className="workout-session__finish"
              disabled={ending}
              onClick={endWorkout}
            >
              {ending
                ? "Kończenie..."
                : "Zakończ trening"}
            </button>
          )}
        </div>

        {error && (
          <div className="workout-error">
            {error}
          </div>
        )}

        {!session ? (
          <section className="session-card session-card--intro">
            <h2>Przygotuj się do treningu</h2>

            <p>
              Rozpocznij trening, aby zapisywać ciężar
              i powtórzenia dla każdej serii.
            </p>

            <div className="workout-summary">
              <span>
                Ćwiczenia
              </span>

              <strong>
                {workout.exercises.length}
              </strong>
            </div>
          </section>
        ) : (
          <div className="session-exercises">
            {workout.exercises.map((item, exerciseIndex) => (
              <section
                className="session-card"
                key={item.id}
              >
                <div className="session-card__header">
                  <div>
                    <span className="session-card__number">
                      ĆWICZENIE {exerciseIndex + 1}
                    </span>

                    <h2>
                      {item.exercise.name}
                    </h2>

                    {item.exercise.muscleGroup && (
                      <p>
                        {item.exercise.muscleGroup}
                      </p>
                    )}
                  </div>

                  <span className="session-card__target">
                    {item.sets} serie × {item.reps}
                  </span>
                </div>

                <div className="sets-list">
                  {Array.from(
                    { length: item.sets },
                    (_, index) => {
                      const setNumber = index + 1;
                      const set = getSetValue(
                        item.exerciseId,
                        setNumber
                      );
                      const saved = isSetSaved(
                        item.exerciseId,
                        setNumber
                      );

                      return (
                        <div
                          className={`set-box ${
                            saved
                              ? "set-box--saved"
                              : ""
                          }`}
                          key={setNumber}
                        >
                          <div className="set-box__header">
                            <h3>
                              Seria {setNumber}
                            </h3>

                            {saved && (
                              <span>
                                Zapisano ✓
                              </span>
                            )}
                          </div>

                          <div className="inputs">
                            <label>
                              Ciężar (kg)

                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={set.weight}
                                onChange={(event) =>
                                  updateSetValue(
                                    item.exerciseId,
                                    setNumber,
                                    "weight",
                                    event.target.value
                                  )
                                }
                              />
                            </label>

                            <label>
                              Powtórzenia

                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={set.reps}
                                onChange={(event) =>
                                  updateSetValue(
                                    item.exerciseId,
                                    setNumber,
                                    "reps",
                                    event.target.value
                                  )
                                }
                              />
                            </label>
                          </div>

                          <button
                            className="set-save-button"
                            onClick={() =>
                              saveSet(
                                item.exerciseId,
                                setNumber
                              )
                            }
                          >
                            {saved
                              ? "Aktualizuj serię"
                              : "Zapisz serię"}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        <button
          className="workout-session__back"
          onClick={() => navigate("/training-center/plan")}
        >
          ← Wróć do planu treningowego
        </button>
      </div>
    </main>
  );
}
