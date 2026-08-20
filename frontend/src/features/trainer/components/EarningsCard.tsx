interface Earnings {
  monthly?: number;
  total?: number;
  paymentsCount?: number;
}

interface Props {
  earnings?: Earnings | null;
}

export default function EarningsCard({ earnings }: Props) {
  return (
    <section className="earnings-card">
      <header className="earnings-card__header">
        <h2>Zarobki</h2>
      </header>

      <div className="earnings-card__stats">
        <article>
          <strong>{earnings?.monthly ?? 0} zł</strong>
          <span>Ten miesiąc</span>
        </article>

        <article>
          <strong>{earnings?.paymentsCount ?? 0}</strong>
          <span>Płatności</span>
        </article>

        <article>
          <strong>{earnings?.total ?? 0} zł</strong>
          <span>Łącznie</span>
        </article>
      </div>
    </section>
  );
}
