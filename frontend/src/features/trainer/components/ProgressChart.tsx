interface ProgressEntry {
  id?: string;
  date: string;
  weight?: number;
}

interface Props {
  history?: ProgressEntry[];
}

export default function ProgressChart({ history = [] }: Props) {
  if (history.length === 0) {
    return (
      <section className="progress-chart">
        <p>Brak danych do wykresu.</p>
      </section>
    );
  }

  const maxWeight = Math.max(
    ...history.map((entry) => entry.weight ?? 0),
  );
  const minWeight = Math.min(
    ...history.map((entry) => entry.weight ?? 0),
  );

  return (
    <section className="progress-chart">
      <header>
        <p>WYKRES POSTĘPÓW</p>
        <h2>Zmiana masy ciała</h2>
      </header>

      <div className="progress-chart__list">
        {history.map((entry) => {
          const range = maxWeight - minWeight || 1;
          const position = ((entry.weight ?? 0) - minWeight) / range;

          return (
            <article key={entry.id ?? entry.date}>
              <span>{entry.date}</span>
              <div className="progress-chart__bar">
                <div style={{ width: `${position * 100}%` }} />
              </div>
              <strong>{entry.weight ?? "-"} kg</strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}
