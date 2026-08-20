interface ExerciseProgressCardProps {
  exercise: {
    name: string;
    muscleGroup: string | null;
    latest: {
      bestWeight: number;
    } | null;
    previous: {
      bestWeight: number;
    } | null;
    bestWeight: number;
  };
}

const ExerciseProgressCard = ({ exercise }: ExerciseProgressCardProps) => {
  const change = exercise.previous && exercise.latest
    ? exercise.latest.bestWeight - exercise.previous.bestWeight
    : null;

  return (
    <div className="progress-card progress-card--analysis">
      <span className="progress-card__label">WYBRANE ĆWICZENIE</span>

      <div className="progress-analysis__heading">
        <h3>{exercise.name}</h3>
        <p>{exercise.muscleGroup}</p>
      </div>

      <div className="progress-analysis__stats">
        <div>
          <span>OSTATNI WYNIK</span>
          <strong>{exercise.latest?.bestWeight ?? 0} kg</strong>
        </div>

        <div>
          <span>REKORD</span>
          <strong>{exercise.bestWeight} kg</strong>
        </div>

        <div>
          <span>ZMIANA</span>
          <strong className="progress-value--positive">
            {change !== null && change > 0 ? `+${change} kg` : change !== null ? `${change} kg` : "—"}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default ExerciseProgressCard;
