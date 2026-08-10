import './ForClients.css'

const clientFeatures = [
  {
    title: 'Znajdź swojego trenera',
    description:
      'Przeglądaj profile trenerów, sprawdzaj ich ofertę i wybierz osobę dopasowaną do Twoich celów.',
  },
  {
    title: 'Umawiaj treningi',
    description:
      'Wybierz dostępny termin i opłać trening bezpośrednio przez FITBOOK.',
  },
  {
    title: 'Miej plan zawsze przy sobie',
    description:
      'Twój indywidualny plan treningowy jest dostępny w aplikacji podczas każdego treningu.',
  },
  {
    title: 'Obserwuj swój progres',
    description:
      'Zapisuj ciężary, wagę, wymiary i inne parametry, aby widzieć realne efekty swojej pracy.',
  },
]

function ForClients() {
  return (
    <section className="for-clients" id="clients">
      <div className="for-clients__container">
        <div className="for-clients__header">
          <p className="for-clients__eyebrow">DLA KLIENTÓW</p>

          <h2 className="for-clients__title">
            Twój trening.
            <br />
            <span>Twoje zasady.</span>
          </h2>

          <p className="for-clients__description">
            FITBOOK łączy Cię z trenerem i daje Ci wszystkie
            narzędzia potrzebne do świadomego trenowania.
          </p>
        </div>

        <div className="for-clients__layout">
          <div className="client-dashboard">
            <div className="client-dashboard__topbar">
              <strong>FITBOOK</strong>

              <div className="client-dashboard__icons">
                <span>●</span>
                <span>DM</span>
              </div>
            </div>

            <div className="client-dashboard__content">
              <div className="client-dashboard__greeting">
                <span>Twój dashboard</span>
                <h3>Cześć, Damian 👋</h3>
              </div>

              <div className="client-dashboard__section-label">
                NASTĘPNY TRENING
              </div>

              <div className="client-dashboard__workout">
                <div className="client-dashboard__workout-date">
                  <span>JUTRO</span>
                  <strong>18:00</strong>
                </div>

                <div className="client-dashboard__workout-info">
                  <strong>Michał Kowalski</strong>
                  <span>Trening personalny · 60 min</span>
                </div>

                <button>Szczegóły</button>
              </div>

              <div className="client-dashboard__section-label">
                TWÓJ PROGRES
              </div>

              <div className="client-dashboard__stats">
                <div>
                  <span>Bench Press</span>
                  <strong>95 kg</strong>
                  <small>↑ +5 kg</small>
                </div>

                <div>
                  <span>Przysiad</span>
                  <strong>120 kg</strong>
                  <small>↑ +10 kg</small>
                </div>

                <div>
                  <span>Waga</span>
                  <strong>89.4 kg</strong>
                  <small>↑ +0.8 kg</small>
                </div>
              </div>

              <div className="client-dashboard__progress">
                <div className="client-dashboard__progress-header">
                  <span>Postęp celu</span>
                  <strong>72%</strong>
                </div>

                <div className="client-dashboard__progress-bar">
                  <div />
                </div>
              </div>
            </div>
          </div>

          <div className="for-clients__features">
            {clientFeatures.map((feature, index) => (
              <article
                className="client-feature"
                key={feature.title}
              >
                <span className="client-feature__number">
                  0{index + 1}
                </span>

                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForClients