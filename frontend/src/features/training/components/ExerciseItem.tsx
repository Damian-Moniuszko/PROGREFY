interface ExerciseItemProps {
  exercise: {
    name: string;
    muscleGroup: string | null;
  };
  sets: number;
  reps: string;
}

const ExerciseItem = ({ exercise, sets, reps }: ExerciseItemProps) => {
  return (
    <div className="exercise">
      <div>
        <strong>{exercise.name}</strong>
        <p>{exercise.muscleGroup}</p>
      </div>
      <span>
        {sets} serie × {reps}
      </span>
    </div>
  );
};

export default ExerciseItem;
