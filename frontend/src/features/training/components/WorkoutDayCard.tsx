import ExerciseItem from './ExerciseItem';

interface WorkoutDayCardProps {
  workout: {
    name: string;
    dayOfWeek: string | null;
    exercises: {
      id: number;
      sets: number;
      reps: string;
      exercise: {
        name: string;
        muscleGroup: string | null;
      };
    }[];
  };
  onStart: () => void;
}

const WorkoutDayCard = ({ workout, onStart }: WorkoutDayCardProps) => {
  return (
    <div className="workout-card">
      <div className="workout-title">
        <div>
          <span>{workout.dayOfWeek}</span>
          <h2>{workout.name}</h2>
        </div>

        <button className="workout-start-button" onClick={onStart}>
          Rozpocznij trening
        </button>
      </div>

      {workout.exercises.map((item) => (
        <ExerciseItem
          key={item.id}
          exercise={item.exercise}
          sets={item.sets}
          reps={item.reps}
        />
      ))}
    </div>
  );
};

export default WorkoutDayCard;
