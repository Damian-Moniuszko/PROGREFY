import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./TrainingProgressPage.css";
import TrainingCenterHeader from "../components/TrainingCenterHeader";

interface ExerciseSet {
  id: number;
  exerciseId: number;
  weight: number;
  reps: number;
  setNumber: number;
  exercise: {
    id: number;
    name: string;
    muscleGroup: string | null;
  };
}

interface ExerciseProgress {
  exerciseId: number;
  name: string;
  muscleGroup: string | null;
  latest: {
    bestWeight: number;
    startedAt: string;
    sets: number;
  } | null;
  previous: {
    bestWeight: number;
  } | null;
  bestWeight: number;
  history: Array<{
    startedAt: string;
    bestWeight: number;
    sets: number;
  }>;
}

interface WorkoutSession {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  workout: {
    id: number;
    name: string;
    dayOfWeek: string | null;
  } | null;
  sets: ExerciseSet[];
}

export default function TrainingProgressPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseProgress | null>(null);

  useEffect(() => {
    async function loadHistory() {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/training/history",
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
            data.message || "Nie udało się pobrać historii treningów."
          );
        }

        setSessions(data.sessions ?? []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać historii treningów."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();

    async function loadProgress() {
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:3000/api/training/progress",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
            setExerciseProgress(data.exercises ?? []);
            setSelectedExercise(data.exercises?.[0] ?? null);
        }
      } catch {
        // historia treningów nadal działa niezależnie
      }
    }

    loadProgress();
  }, [token, logout, navigate]);

  const totalSets = useMemo(
    () => sessions.reduce((sum, session) => sum + session.sets.length, 0),
    [sessions]
  );

  const totalWorkouts = sessions.length;

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  }

  function formatTime(value: string) {
    return new Intl.DateTimeFormat("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  return (
    <main className="training-progress">
      <div className="training-progress__container">
        <TrainingCenterHeader firstName="Damian" />

        <header className="training-progress__header">
          <p className="training-progress__eyebrow">
            PROGRES
          </p>

          <h1>Historia treningów</h1>

          <p>
            Sprawdzaj wykonane treningi i zapisane wyniki.
          </p>
        </header>

        {loading ? (
          <section className="progress-card">
            <p>Ładowanie historii treningów...</p>
          </section>
        ) : error ? (
          <section className="progress-card progress-card--error">
            <p>{error}</p>
          </section>
        ) : (
          <>
            <section className="progress-stats">
              <div className="progress-stat">
                <span>UKOŃCZONE TRENINGI</span>
                <strong>{totalWorkouts}</strong>
              </div>

              <div className="progress-stat">
                <span>ZAPISANE SERIE</span>
                <strong>{totalSets}</strong>
              </div>

              <div className="progress-stat">
                <span>OSTATNI TRENING</span>
                <strong>
                  {sessions.length > 0
                    ? formatDate(sessions[0].startedAt)
                    : "—"}
                </strong>
              </div>
            </section>


            {exerciseProgress.length > 0 && (
              <section className="progress-analysis">
                <p className="training-progress__eyebrow">
                  ANALIZA
                </p>
                <h2>Progres ćwiczeń</h2>

                <div className="progress-analysis__grid">
                  <div className="progress-card progress-card--exercise-list">
                    <span className="progress-card__label">
                      ĆWICZENIA
                    </span>

                    <div className="progress-exercise-list">
                      {exerciseProgress.map((exercise) => (
                        <button
                          key={exercise.exerciseId}
                          className={
                            selectedExercise?.exerciseId === exercise.exerciseId
                              ? "progress-exercise progress-exercise--active"
                              : "progress-exercise"
                          }
                          onClick={() => setSelectedExercise(exercise)}
                        >
                          <span>
                            <strong>{exercise.name}</strong>
                            <small>{exercise.muscleGroup}</small>
                          </span>
                          <strong>{exercise.bestWeight} kg</strong>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedExercise && (
                    <div className="progress-card progress-card--analysis">
                      <span className="progress-card__label">
                        WYBRANE ĆWICZENIE
                      </span>

                      <div className="progress-analysis__heading">
                        <h3>{selectedExercise.name}</h3>
                        <p>{selectedExercise.muscleGroup}</p>
                      </div>

                      <div className="progress-analysis__stats">
                        <div>
                          <span>OSTATNI WYNIK</span>
                          <strong>{selectedExercise.latest?.bestWeight ?? 0} kg</strong>
                        </div>

                        <div>
                          <span>REKORD</span>
                          <strong>{selectedExercise.bestWeight} kg</strong>
                        </div>

                        <div>
                          <span>ZMIANA</span>
                          <strong className="progress-value--positive">
                            {selectedExercise.previous
                              ? `${selectedExercise.latest!.bestWeight - selectedExercise.previous.bestWeight > 0 ? "+" : ""}${selectedExercise.latest!.bestWeight - selectedExercise.previous.bestWeight} kg`
                              : "—"}
                          </strong>
                        </div>
                      </div>

                      <div className="progress-chart">
                        {selectedExercise.history.map((item, index) => (
                          <div className="progress-chart__item" key={index}>
                            <span>{item.bestWeight} kg</span>
                            <div
                              style={{
                                height: `${Math.max(item.bestWeight, 10)}px`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {sessions.length === 0 ? (
              <section className="progress-card progress-card--empty">
                <span>HISTORIA</span>

                <h2>Brak ukończonych treningów</h2>

                <p>
                  Rozpocznij trening z planu treningowego i
                  zapisuj swoje serie. Wyniki pojawią się tutaj.
                </p>

                <button
                  onClick={() => navigate("/training-center/plan")}
                >
                  Przejdź do planu treningowego
                </button>
              </section>
            ) : (
              <section className="progress-history">
                <div className="progress-section__header">
                  <div>
                    <p className="training-progress__eyebrow">
                      HISTORIA
                    </p>
                    <h2>Ostatnie treningi</h2>
                  </div>
                </div>

                <div className="progress-session-list">
                  {sessions.map((session) => (
                    <article
                      className="progress-session"
                      key={session.id}
                    >
                      <div className="progress-session__main">
                        <span>
                          {session.workout?.dayOfWeek ??
                            "TRENING"}
                        </span>

                        <h3>
                          {session.workout?.name ?? "Trening"}
                        </h3>

                        <p>
                          {formatDate(session.startedAt)}
                          {" • "}
                          {formatTime(session.startedAt)}
                        </p>
                      </div>

                      <div className="progress-session__summary">
                        <div>
                          <span>SERIE</span>
                          <strong>{session.sets.length}</strong>
                        </div>

                        <button
                          onClick={() =>
                            setSelectedSession(
                              selectedSession?.id === session.id
                                ? null
                                : session
                            )
                          }
                        >
                          {selectedSession?.id === session.id
                            ? "Ukryj szczegóły"
                            : "Zobacz szczegóły"}
                        </button>
                      </div>

                      {selectedSession?.id === session.id && (
                        <div className="progress-session__details">
                          {session.sets.length === 0 ? (
                            <p>
                              Ten trening nie ma zapisanych serii.
                            </p>
                          ) : (
                            session.sets.map((set) => (
                              <div
                                className="progress-set"
                                key={set.id}
                              >
                                <div>
                                  <strong>
                                    {set.exercise.name}
                                  </strong>

                                  {set.exercise.muscleGroup && (
                                    <span>
                                      {set.exercise.muscleGroup}
                                    </span>
                                  )}
                                </div>

                                <strong>
                                  Seria {set.setNumber}
                                </strong>

                                <strong>
                                  {set.weight} kg × {set.reps}
                                </strong>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
