import './ForTrainers.css'

const trainerFeatures = [
  {
    title: 'Zarządzaj podopiecznymi',
    description:
      'Wszystkie profile klientów, ich progres i najważniejsze parametry w jednym miejscu.',
  },
  {
    title: 'Planuj treningi',
    description:
      'Twórz indywidualne plany treningowe i przypisuj je konkretnym podopiecznym.',
  },
  {
    title: 'Kontroluj kalendarz',
    description:
      'Wszystkie treningi i rezerwacje masz zawsze pod ręką.',
  },
  {
    title: 'Otrzymuj płatności',
    description:
      'Klient opłaca trening podczas rezerwacji, a Ty otrzymujesz płatność bezpośrednio.',
  },
]

const appointments = [
  {
    time: '09:00',
    name: 'Jan Kowalski',
    type: 'Trening personalny',
  },
  {
    time: '11:00',
    name: 'Anna Nowak',
    type: 'Trening personalny',
  },
  {
    time: '17:00',
    name: 'Piotr Wiśniewski',
    type: 'Trening personalny',
  },
]

function ForTrainers() {
  return (
    <section className="for-trainers" id="trainers">
      <div className="for-trainers__container">
        <div className="for-trainers__header">
          <p className="for-trainers__eyebrow">DLA TRENERÓW</p>

          <h2 className="for-trainers__title">
            Twój biznes.
            <br />
            <span>Jedno miejsce.</span>
          </h2>

          <p className="for-trainers__description">
            Pozyskuj klientów, zarządzaj treningami, prowadź
            podopiecznych i kontroluj płatności — bez kilku różnych
            narzędzi.
          </p>
        </div>

        <div className="for-trainers__layout">
          <div className="for-trainers__features">
            {trainerFeatures.map((feature, index) => (
              <article
                className="trainer-feature"
                key={feature.title}
              >
                <span className="trainer-feature__number">
                  0{index + 1}
                </span>

                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="trainer-dashboard">
            <div className="trainer-dashboard__topbar">
              <strong>FITBOOK</strong>

              <div className="trainer-dashboard__profile">
                <span className="trainer-dashboard__status">
                  ●
                </span>
                <span>MK</span>
              </div>
            </div>

            <div className="trainer-dashboard__content">
              <div className="trainer-dashboard__greeting">
                <span>Twój dashboard</span>
                <h3>Dzień dobry, Michał</h3>
              </div>

              <div className="trainer-dashboard__section-label">
                DZISIAJ
              </div>

              <div className="trainer-dashboard__appointments">
                {appointments.map((appointment) => (
                  <div
                    className="trainer-appointment"
                    key={`${appointment.time}-${appointment.name}`}
                  >
                    <div className="trainer-appointment__time">
                      {appointment.time}
                    </div>

                    <div className="trainer-appointment__info">
                      <strong>{appointment.name}</strong>
                      <span>{appointment.type}</span>
                    </div>

                    <span className="trainer-appointment__arrow">
                      →
                    </span>
                  </div>
                ))}
              </div>

              <div className="trainer-dashboard__stats">
                <div>
                  <span>Podopieczni</span>
                  <strong>24</strong>
                  <small>+3 w tym miesiącu</small>
                </div>

                <div>
                  <span>Przychód</span>
                  <strong>8 450 zł</strong>
                  <small>+12.4%</small>
                </div>
              </div>

              <div className="trainer-dashboard__bottom">
                <div>
                  <span>Aktywne plany</span>
                  <strong>18</strong>
                </div>

                <div>
                  <span>Treningi w tym tygodniu</span>
                  <strong>27</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForTrainers