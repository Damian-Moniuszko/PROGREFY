interface ProgressPhoto {
  id?: string;
  url: string;
  date?: string;
  type?: "front" | "side" | "back";
}

interface Props {
  photos?: ProgressPhoto[];
}

const photoLabels = {
  front: "Przód",
  side: "Bok",
  back: "Tył",
};

export default function ClientPhotos({ photos = [] }: Props) {
  return (
    <section className="client-photos">
      <header className="client-photos__header">
        <p>ZDJĘCIA PROGRESU</p>
        <h2>Porównanie przemiany</h2>
      </header>

      {photos.length === 0 ? (
        <p>Brak zdjęć progresu.</p>
      ) : (
        <div className="client-photos__grid">
          {photos.map((photo) => (
            <article key={photo.id ?? photo.url}>
              <img src={photo.url} alt="Postęp klienta" />

              <div>
                {photo.type && <strong>{photoLabels[photo.type]}</strong>}
                {photo.date && <span>{photo.date}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
