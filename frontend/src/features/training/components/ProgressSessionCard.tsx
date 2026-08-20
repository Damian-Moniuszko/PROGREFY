interface ProgressSessionCardProps {
  session: {
    id: number;
    date: string;
    workoutName?: string;
    exercises?: {
      name: string;
      sets: number;
      reps: string;
      weight: number;
    }[];
  };
}

const ProgressSessionCard = ({ session }: ProgressSessionCardProps) => {
  return (
    <article className="progress-session-card">
      <header>
        <h3>{session.workoutName ?? "Trening"}</h3>
        <span>{new Date(session.date).toLocaleDateString()}</span>
      </header>

      <div>
        {session.exercises?.map((exercise) => (
          <p key={exercise.name}>
            {exercise.name} — {exercise.sets} serie × {exercise.reps} ({exercise.weight} kg)
          </p>
        ))}
      </div>
    </article>
  );
};

export default ProgressSessionCard;
