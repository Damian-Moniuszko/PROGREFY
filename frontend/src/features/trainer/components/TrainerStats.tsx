interface Props {
  clientsCount: number;
  workoutsCount: number;
  earnings: unknown;
}

export default function TrainerStats({
  clientsCount,
  workoutsCount,
  earnings,
}: Props) {
  return (
    <section className="trainer-stats">
      <article className="trainer-stat-card">
        <strong>{clientsCount}</strong>
        <span>Klienci</span>
      </article>

      <article className="trainer-stat-card">
        <strong>{workoutsCount}</strong>
        <span>Dzisiejsze treningi</span>
      </article>

      <article className="trainer-stat-card">
        <strong>{earnings ? "✓" : "0"}</strong>
        <span>Przychód</span>
      </article>
    </section>
  );
}
