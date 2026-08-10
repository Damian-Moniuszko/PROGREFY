import './AppPreview.css'

function AppPreview() {
  return (
    <section className="app-preview">
      <div className="app-preview__container">
        <div className="app-preview__header">
          <p className="app-preview__eyebrow">FITBOOK APP</p>

          <h2 className="app-preview__title">
            Jedna aplikacja.
            <br />
            <span>Cały Twój trening.</span>
          </h2>

          <p className="app-preview__description">
            Rezerwacje, plany treningowe i progres.
            Wszystko, czego potrzebujesz, zawsze pod ręką.
          </p>
        </div>

        <div className="app-preview__grid">

          {/* Kalendarz */}

          <div className="preview-card preview-card--calendar">
            <div className="preview-card__top">
              <span>KALENDARZ</span>
              <span>MAJ 2026</span>
            </div>

            <div className="calendar">
              <div className="calendar__days">
                <span>PON</span>
                <span>WT</span>
                <span>ŚR</span>
                <span>CZW</span>
                <span>PT</span>
                <span>SOB</span>
                <span>NIE</span>
              </div>

              <div className="calendar__dates">
                <span>11</span>
                <span>12</span>
                <span className="is-active">13</span>
                <span>14</span>
                <span>15</span>
                <span>16</span>
                <span>17</span>
              </div>

              <div className="calendar__appointment">
                <div>
                  <span>18:00</span>
                  <strong>Michał Kowalski</strong>
                </div>

                <small>Trening personalny</small>
              </div>
            </div>
          </div>

          {/* Plan treningowy */}

          <div className="preview-card preview-card--workout">
            <div className="preview-card__top">
              <span>PLAN TRENINGOWY</span>
              <span>PUSH</span>
            </div>

            <div className="workout">
              <div className="workout__header">
                <div>
                  <span>DZISIAJ</span>
                  <h3>Push A</h3>
                </div>

                <strong>4 ćwiczenia</strong>
              </div>

              <div className="exercise">
                <div>
                  <strong>Bench Press</strong>
                  <span>Klatka piersiowa</span>
                </div>

                <b>4 × 8</b>
              </div>

              <div className="exercise">
                <div>
                  <strong>Incline DB Press</strong>
                  <span>Klatka piersiowa</span>
                </div>

                <b>3 × 10</b>
              </div>

              <div className="exercise">
                <div>
                  <strong>Shoulder Press</strong>
                  <span>Barki</span>
                </div>

                <b>3 × 10</b>
              </div>

              <div className="exercise">
                <div>
                  <strong>Lateral Raise</strong>
                  <span>Barki</span>
                </div>

                <b>3 × 12</b>
              </div>
            </div>
          </div>

          {/* Progres */}

          <div className="preview-card preview-card--progress">
            <div className="preview-card__top">
              <span>TWÓJ PROGRES</span>
              <span>BENCH PRESS</span>
            </div>

            <div className="progress">
              <div className="progress__header">
                <div>
                  <span>Najlepszy wynik</span>
                  <strong>95 kg</strong>
                </div>

                <small>+18%</small>
              </div>

              <div className="chart">
                <div className="chart__line chart__line--one" />
                <div className="chart__line chart__line--two" />
                <div className="chart__line chart__line--three" />

                <svg
                  className="chart__graph"
                  viewBox="0 0 500 200"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="0,170 70,150 140,155 210,120 280,125 350,75 420,85 500,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              </div>

              <div className="chart__labels">
                <span>MAR</span>
                <span>KWI</span>
                <span>MAJ</span>
                <span>CZE</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default AppPreview