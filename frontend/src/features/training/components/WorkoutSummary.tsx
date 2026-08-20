interface WorkoutSummaryProps {
  exercisesCount: number;
}

const WorkoutSummary = ({ exercisesCount }: WorkoutSummaryProps) => {
  return (
    <section className="session-card session-card--intro">
      <h2>Przygotuj się do treningu</h2>

      <p>
        Rozpocznij trening, aby zapisywać ciężar i powtórzenia dla każdej serii.
      </p>

      <div className="workout-summary">
        <span>Ćwiczenia</span>
        <strong>{exercisesCount}</strong>
      </div>
    </section>
  );
};

export default WorkoutSummary;
