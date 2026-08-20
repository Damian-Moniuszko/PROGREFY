interface ProgressData {
  weight?: number;
  height?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    arm?: number;
  };
  photos?: string[];
}

interface Props {
  progress?: ProgressData | null;
}

export default function ClientProgress({ progress }: Props) {
  return (
    <section className="client-progress">
      <header className="client-progress__header">
        <p>POSTĘPY KLIENTA</p>
        <h2>Śledzenie przemiany</h2>
      </header>

      <div className="client-progress__stats">
        <article>
          <strong>{progress?.weight ?? "-"} kg</strong>
          <span>Waga</span>
        </article>

        <article>
          <strong>{progress?.height ?? "-"} cm</strong>
          <span>Wzrost</span>
        </article>

        <article>
          <strong>{progress?.bodyFat ?? "-"}%</strong>
          <span>Poziom tłuszczu</span>
        </article>
      </div>

      <section>
        <h3>Obwody</h3>
        <p>Klatka: {progress?.measurements?.chest ?? "-"} cm</p>
        <p>Talia: {progress?.measurements?.waist ?? "-"} cm</p>
        <p>Ramię: {progress?.measurements?.arm ?? "-"} cm</p>
      </section>

      <section>
        <h3>Zdjęcia progresu</h3>
        {progress?.photos?.length ? (
          <p>{progress.photos.length} zdjęć zapisanych</p>
        ) : (
          <p>Brak zdjęć progresu.</p>
        )}
      </section>
    </section>
  );
}
