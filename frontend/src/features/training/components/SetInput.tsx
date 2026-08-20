interface SetInputProps {
  setNumber: number;
  weight: string;
  reps: string;
  saved: boolean;
  onChange: (
    field: "weight" | "reps",
    value: string
  ) => void;
  onSave: () => void;
}

const SetInput = ({
  setNumber,
  weight,
  reps,
  saved,
  onChange,
  onSave,
}: SetInputProps) => {
  return (
    <div className={`set-box ${saved ? "set-box--saved" : ""}`}>
      <h3>Seria {setNumber}</h3>

      <input
        type="number"
        placeholder="Ciężar"
        value={weight}
        onChange={(event) => onChange("weight", event.target.value)}
      />

      <input
        type="number"
        placeholder="Powtórzenia"
        value={reps}
        onChange={(event) => onChange("reps", event.target.value)}
      />

      <button onClick={onSave}>
        {saved ? "Aktualizuj serię" : "Zapisz serię"}
      </button>
    </div>
  );
};

export default SetInput;
