interface TrainingPlanHeaderProps {
  name: string;
  description: string | null;
  durationWeeks: number | null;
}

const TrainingPlanHeader = ({ name, description, durationWeeks }: TrainingPlanHeaderProps) => {
  return (
    <div className="plan-header">
      <span>PLAN TRENINGOWY</span>
      <h1>{name}</h1>
      <p>{description}</p>
      {durationWeeks && <p>Czas trwania: {durationWeeks} tygodni</p>}
    </div>
  );
};

export default TrainingPlanHeader;
