import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import './ReportPage.css'

const reportReasons = [
  'Niewłaściwe zachowanie trenera',
  'Problem z realizacją usługi',
  'Nieprawidłowe informacje w profilu lub ofercie',
  'Problem z płatnością lub rezerwacją',
  'Bezpieczeństwo lub naruszenie zasad',
  'Inny problem',
]

function ReportPage() {
  const { id } = useParams()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="report-page">
      <div className="report-page__container">
        <Link className="report-page__back" to={`/trainers/${id}`}>
          ← Wróć do profilu trenera
        </Link>

        <header className="report-page__header">
          <p className="report-page__eyebrow">CENTRUM POMOCY</p>
          <h1>Zgłoś problem dotyczący trenera</h1>
          <p>
            Opisz sytuację możliwie konkretnie. Twoje zgłoszenie trafi do zespołu PROGREFY
            do weryfikacji.
          </p>
        </header>

        {submitted ? (
          <section className="report-page__success" aria-live="polite">
            <span>✓</span>
            <h2>Dziękujemy za zgłoszenie</h2>
            <p>
              Formularz został poprawnie uzupełniony. Integracja z systemem obsługi zgłoszeń
              wymaga jeszcze zapisania zgłoszenia przez API.
            </p>
            <Link to={`/trainers/${id}`}>Wróć do profilu trenera</Link>
          </section>
        ) : (
          <form className="report-form" onSubmit={handleSubmit}>
            <div className="report-form__notice">
              <strong>Ważne:</strong> nie wpisuj haseł, danych karty ani danych wrażliwych.
            </div>

            <div className="report-form__group">
              <label htmlFor="reason">Czego dotyczy zgłoszenie? <span>*</span></label>
              <select id="reason" name="reason" required defaultValue="">
                <option value="" disabled>Wybierz kategorię</option>
                {reportReasons.map((reason) => <option key={reason}>{reason}</option>)}
              </select>
            </div>

            <div className="report-form__group">
              <label htmlFor="description">Opisz problem <span>*</span></label>
              <textarea
                id="description"
                name="description"
                required
                minLength={20}
                maxLength={3000}
                placeholder="Co się wydarzyło? Kiedy miała miejsce sytuacja i czego dotyczyła?"
              />
              <small>Minimum 20 znaków, maksymalnie 3000 znaków.</small>
            </div>

            <div className="report-form__grid">
              <div className="report-form__group">
                <label htmlFor="date">Data zdarzenia</label>
                <input id="date" name="date" type="date" />
              </div>
              <div className="report-form__group">
                <label htmlFor="booking">Numer rezerwacji (opcjonalnie)</label>
                <input id="booking" name="booking" type="text" maxLength={50} placeholder="np. 12345" />
              </div>
            </div>

            <div className="report-form__group">
              <label htmlFor="contact">Adres e-mail do kontaktu <span>*</span></label>
              <input id="contact" name="contact" type="email" required placeholder="twoj@email.pl" />
              <small>Użyjemy go wyłącznie, jeśli będziemy potrzebować dodatkowych informacji.</small>
            </div>

            <label className="report-form__checkbox">
              <input type="checkbox" required />
              <span>Potwierdzam, że podane informacje są zgodne z moją najlepszą wiedzą. <b>*</b></span>
            </label>

            <button className="report-form__submit" type="submit">Wyślij zgłoszenie</button>
            <p className="report-form__required"><span>*</span> Pola wymagane</p>
          </form>
        )}
      </div>
    </main>
  )
}

export default ReportPage
