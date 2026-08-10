import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__text">
          <p className="hero__eyebrow">YOUR TRAINING. YOUR PROGRESS.</p>

          <h1 className="hero__title">
            Wszystko, czego
            <span> potrzebujesz </span>
            do treningu.
          </h1>

          <p className="hero__description">
            Znajdź trenera, zarezerwuj trening, realizuj swój plan
            i śledź progres. Wszystko w jednym miejscu.
          </p>

          <div className="hero__actions">
            <button className="hero__button hero__button--primary">
              Znajdź trenera
            </button>

            <button className="hero__button hero__button--secondary">
              Jestem trenerem
            </button>
          </div>
        </div>

        <div className="hero__preview">
          <div className="hero-card">
            <div className="hero-card__header">
              <span>FITBOOK</span>
              <span className="hero-card__status">●</span>
            </div>

            <div className="hero-card__greeting">
              <span>Twój następny trening</span>
              <strong>Jutro · 18:00</strong>
            </div>

            <div className="hero-card__trainer">
              <div className="hero-card__avatar">MK</div>

              <div>
                <strong>Michał Kowalski</strong>
                <span>Trening personalny · 60 min</span>
              </div>
            </div>

            <div className="hero-card__progress">
              <div className="hero-card__progress-header">
                <span>Twój progres</span>
                <strong>+12%</strong>
              </div>

              <div className="hero-card__progress-bar">
                <div />
              </div>
            </div>

            <div className="hero-card__stats">
              <div>
                <span>Bench Press</span>
                <strong>95 kg</strong>
              </div>

              <div>
                <span>Waga</span>
                <strong>89.4 kg</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero