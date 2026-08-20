import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import ProgressHeader from "../components/ProgressHeader";
import ProgressStats from "../components/ProgressStats";
import ExerciseProgressCard from "../components/ExerciseProgressCard";
import ProgressChart from "../components/ProgressChart";
import ProgressSessionCard from "../components/ProgressSessionCard";
import "./TrainingProgressPage.css";

interface Session {
  id: number;
  startedAt: string;
  workout?: { name: string } | null;
}

export default function TrainingProgressPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    Promise.all([
      fetch("http://localhost:3000/api/training/history", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch("http://localhost:3000/api/training/progress", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ]).then(([history, progress]) => {
      setSessions(history.sessions ?? []);
      setExerciseProgress(progress.exercises ?? []);
      setSelectedExercise(progress.exercises?.[0] ?? null);
    });
  }, [token, navigate]);

  const totalSets = useMemo(() => sessions.length, [sessions]);

  return (
    <main className="training-progress">
      <div className="training-progress__container">
        <ProgressHeader />
        <ProgressStats
          totalWorkouts={sessions.length}
          totalSets={totalSets}
          lastWorkout={sessions[0]?.startedAt ?? "—"}
        />

        {selectedExercise && <ExerciseProgressCard exercise={selectedExercise} />}

        {selectedExercise && (
          <ProgressChart
            data={selectedExercise.history.map((item: any) => ({
              date: item.startedAt,
              weight: item.bestWeight,
            }))}
          />
        )}

        {sessions.map((session) => (
          <ProgressSessionCard key={session.id} session={session as any} />
        ))}
      </div>
    </main>
  );
}
