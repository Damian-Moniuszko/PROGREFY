interface ExerciseSessionCardProps {
  exercise: {
    exerciseId: number;
    sets: number;
    reps: string;
    exercise: {
      name: string;
      muscleGroup: string | null;
    };
  };
  index: number;
  getSetValue: (exerciseId: number, setNumber: number) => {
    weight: string;
    reps: string;
  };
  isSetSaved: (exerciseId: number, setNumber: number) => boolean;
  onChange: (
    exerciseId: number,
    setNumber: number,
    field: "weight" | "reps",
    value: string
  ) => void;
  onSave: (exerciseId: number, setNumber: number) => void;
}

const ExerciseSessionCard = ({
  exercise,
  index,
  getSetValue,
  isSetSaved,
  onChange,
  onSave,
}: ExerciseSessionCardProps) => {
  return (
    <section className="session-card">
      <div className="session-card__header">
        <div>
          <span className="session-card__number">
            ĆWICZENIE {index + 1}
          </span>
          <h2>{exercise.exercise.name}</h2>
          {exercise.exercise.muscleGroup && (
            <p>{exercise.exercise.muscleGroup}</p>
          )}
        </div>

        <span className="session-card__target">
          {exercise.sets} serie × {exercise.reps}
        </span>
      </div>

      <div className="sets-list">
        {Array.from({ length: exercise.sets }, (_, i) => {
          const setNumber = i + 1;
          const set = getSetValue(exercise.exerciseId, setNumber);
          const saved = isSetSaved(exercise.exerciseId, setNumber);

          return (
            <div className={`set-box ${saved ? "set-box--saved" : ""}`} key={setNumber}>
              <h3>Seria {setNumber}</h3>

              <input
                type="number"
                placeholder="Ciężar"
                value={set.weight}
                onChange={(event) =>
                  onChange(exercise.exerciseId, setNumber, "weight", event.target.value)
                }
              />

              <input
                type="number"
                placeholder="Powtórzenia"
                value={set.reps}
                onChange={(event) =>
                  onChange(exercise.exerciseId, setNumber, "reps", event.target.value)
                }
              />

              <button onClick={() => onSave(exercise.exerciseId, setNumber)}>
                {saved ? "Aktualizuj serię" : "Zapisz serię"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ExerciseSessionCard;
