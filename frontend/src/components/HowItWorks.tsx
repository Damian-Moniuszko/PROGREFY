import './HowItWorks.css'

const steps = [
  {
    number: '01',
    title: 'Znajdź trenera',
    description:
      'Wybierz trenera dopasowanego do Twoich celów, doświadczenia i oczekiwań.',
  },
  {
    number: '02',
    title: 'Umów trening',
    description:
      'Sprawdź dostępne terminy, wybierz dogodną godzinę i opłać trening online.',
  },
  {
    number: '03',
    title: 'Trenuj według planu',
    description:
      'Otrzymuj indywidualne plany treningowe i miej je zawsze pod ręką.',
  },
  {
    number: '04',
    title: 'Śledź progres',
    description:
      'Zapisuj wyniki, wagę i wymiary oraz obserwuj swoją drogę do celu.',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works__container">
        <div className="how-it-works__header">
          <p className="how-it-works__eyebrow">HOW IT WORKS</p>

          <h2 className="how-it-works__title">
            Od pierwszego treningu
            <br />
            do kolejnego poziomu.
          </h2>
        </div>

        <div className="steps">
          {steps.map((step, index) => (
            <article className="step" key={step.number}>
              <div className="step__top">
                <span className="step__number">{step.number}</span>

                {index < steps.length - 1 && (
                  <span className="step__line" />
                )}
              </div>

              <div className="step__content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks