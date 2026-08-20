import './Features.css'

const features = [
  {
    number: '01',
    title: 'Znajdź trenera',
    description:
      'Znajdź trenera dopasowanego do Twoich celów, doświadczenia i potrzeb.',
  },
  {
    number: '02',
    title: 'Rezerwacje',
    description:
      'Umów trening w dogodnym dla Ciebie terminie i opłać go online.',
  },
  {
    number: '03',
    title: 'Treningi',
    description:
      'Twój indywidualny plan treningowy zawsze dostępny w jednym miejscu.',
  },
  {
    number: '04',
    title: 'Progres',
    description:
      'Śledź wyniki, wagę, wymiary i historię swoich treningów.',
  },
]

function Features() {
  return (
    <section className="features">
      <div className="features__container">
        <div className="features__header">
          <p className="features__eyebrow">PROGREFY ECOSYSTEM</p>

          <h2 className="features__title">
            Wszystko w jednym miejscu.
          </h2>

          <p className="features__subtitle">
            Jedna aplikacja. Cała Twoja droga treningowa.
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <span className="feature-card__number">
                {feature.number}
              </span>

              <div className="feature-card__content">
                <h3>{feature.title}</h3>

                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features