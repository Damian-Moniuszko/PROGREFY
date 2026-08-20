import './CTA.css'

function CTA() {
  return (
    <section className="cta">
      <div className="cta__container">
        <div className="cta__content">
          <p className="cta__eyebrow">ZACZNIJ TERAZ</p>

          <h2 className="cta__title">
            Gotowy na swój
            <br />
            <span>następny poziom?</span>
          </h2>

          <p className="cta__description">
            Dołącz do PROGREFY i miej swój trening,
            trenera oraz progres w jednym miejscu.
          </p>

          <div className="cta__actions">
            <button className="cta__button cta__button--primary">
              Dołącz do PROGREFY
              <span>→</span>
            </button>

            <button className="cta__button cta__button--secondary">
              Jestem trenerem
            </button>
          </div>
        </div>

        <div className="cta__background">
          <span>PROGREFY</span>
        </div>
      </div>
    </section>
  )
}

export default CTA