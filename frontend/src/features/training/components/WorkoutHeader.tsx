interface WorkoutHeaderProps {
  name: string;
  dayOfWeek: string | null;
  started: boolean;
  loading?: boolean;
  onStart: () => void;
  onFinish: () => void;
}

const WorkoutHeader = ({
  name,
  dayOfWeek,
  started,
  loading,
  onStart,
  onFinish,
}: WorkoutHeaderProps) => {
  return (
    <div className="workout-session__top">
      <div>
        <h1>{name}</h1>
        <p>{dayOfWeek ?? "Trening"}</p>
      </div>

      {!started ? (
        <button onClick={onStart} disabled={loading}>
          {loading ? "Rozpoczynanie..." : "Rozpocznij trening"}
        </button>
      ) : (
        <button onClick={onFinish} disabled={loading}>
          {loading ? "Kończenie..." : "Zakończ trening"}
        </button>
      )}
    </div>
  );
};

export default WorkoutHeader;
