interface ProgressEntry {
  id?: string;
  date: string;
  weight?: number;
  bodyFat?: number;
}

interface Props {
  history?: ProgressEntry[];
}

export default function ProgressHistory({ history = [] }: Props) {
  return (
    <section className="progress-history">
      <header className="progress-history__header">
        <p>HISTORIA POSTĘPÓW</p>
        <h2>Zmiany w czasie</h2>
      </header>

      {history.length === 0 ? (
        <p>Brak zapisanej historii pomiarów.</p>
      ) : (
        <div className="progress-history__list">
          {history.map((entry) => (
            <article key={entry.id ?? entry.date}>
              <strong>{entry.date}</strong>
              <span>
                Waga: {entry.weight ?? "-"} kg
              </span>
              <span>
                BF: {entry.bodyFat ?? "-"}%
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
