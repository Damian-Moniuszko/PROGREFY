interface ProgressStatsProps {
  totalWorkouts: number;
  totalSets: number;
  lastWorkout: string;
}

const ProgressStats = ({ totalWorkouts, totalSets, lastWorkout }: ProgressStatsProps) => {
  return (
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
        <strong>{lastWorkout}</strong>
      </div>
    </section>
  );
};

export default ProgressStats;
