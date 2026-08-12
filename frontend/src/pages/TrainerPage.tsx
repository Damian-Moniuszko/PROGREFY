import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './TrainerPage.css'

interface Trainer {
  id: number
  bio: string | null
  specialization: string | null
  price: string | null
  durationMinutes: number | null
  location: string | null
  user: {
    id: number
    firstName: string
    lastName: string
    avatarUrl: string | null
  }
}

interface Slot {
  startTime: string
  endTime: string
  available: boolean
}

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(today.getDate()).padStart(
    2,
    '0',
  )

  return `${year}-${month}-${day}`
}

function TrainerPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [trainer, setTrainer] =
    useState<Trainer | null>(null)

  const [slots, setSlots] = useState<Slot[]>([])

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate())

  const [selectedSlot, setSelectedSlot] =
    useState<Slot | null>(null)

  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] =
    useState(false)

  const [error, setError] = useState('')

  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] =
    useState('')
  const [bookingSuccess, setBookingSuccess] =
    useState(false)

  useEffect(() => {
    async function fetchTrainer() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `http://localhost:3000/api/trainers/${id}`,
        )

        if (!response.ok) {
          throw new Error('Trainer not found')
        }

        const data = await response.json()

        setTrainer(data.trainer)
      } catch {
        setError(
          'Nie udało się pobrać profilu trenera.',
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTrainer()
    }
  }, [id])

  useEffect(() => {
    async function fetchSlots() {
      if (!id || !selectedDate) {
        return
      }

      try {
        setSlotsLoading(true)
        setSelectedSlot(null)
        setBookingError('')
        setBookingSuccess(false)

        const response = await fetch(
          `http://localhost:3000/api/trainers/${id}/slots?date=${selectedDate}`,
        )

        if (!response.ok) {
          throw new Error(
            'Nie udało się pobrać terminów.',
          )
        }

        const data = await response.json()

        setSlots(data.slots ?? [])
      } catch {
        setSlots([])
        setBookingError(
          'Nie udało się pobrać dostępnych terminów.',
        )
      } finally {
        setSlotsLoading(false)
      }
    }

    fetchSlots()
  }, [id, selectedDate])

  async function handleBooking() {
    if (!selectedSlot || !trainer) {
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    setBooking(true)
    setBookingError('')
    setBookingSuccess(false)

    try {
      const startAt = `${selectedDate}T${selectedSlot.startTime}:00`
      const endAt = `${selectedDate}T${selectedSlot.endTime}:00`

      const response = await fetch(
        'http://localhost:3000/api/appointments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            trainerId: trainer.id,
            startAt,
            endAt,
          }),
        },
      )

      const data = await response.json()

      if (response.status === 401) {
        navigate('/login')
        return
      }

      if (response.status === 403) {
        setBookingError(
          'Tylko klient może zarezerwować trening.',
        )
        return
      }

      if (response.status === 409) {
        setBookingError(
          'Ten termin został właśnie zajęty. Wybierz inny.',
        )

        setSlots((currentSlots) =>
          currentSlots.map((slot) =>
            slot.startTime ===
            selectedSlot.startTime
              ? {
                  ...slot,
                  available: false,
                }
              : slot,
          ),
        )

        setSelectedSlot(null)
        return
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Nie udało się zarezerwować treningu.',
        )
      }

      setBookingSuccess(true)

      setSlots((currentSlots) =>
        currentSlots.map((slot) =>
          slot.startTime === selectedSlot.startTime
            ? {
                ...slot,
                available: false,
              }
            : slot,
        ),
      )

      setSelectedSlot(null)

      navigate('/dashboard')
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : 'Nie udało się zarezerwować treningu.',
      )
    } finally {
      setBooking(false)
    }
  }

  function formatSelectedDate() {
    if (!selectedDate) {
      return ''
    }

    return new Intl.DateTimeFormat('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(`${selectedDate}T12:00:00`))
  }

  if (loading) {
    return (
      <main className="trainer-page">
        <div className="trainer-page__loading">
          Ładowanie profilu trenera...
        </div>
      </main>
    )
  }

  if (error || !trainer) {
    return (
      <main className="trainer-page">
        <div className="trainer-page__error">
          {error || 'Nie znaleziono trenera.'}
        </div>
      </main>
    )
  }

  return (
    <main className="trainer-page">
      <div className="trainer-page__container">
        {/* PROFILE */}

        <section className="trainer-profile">
          <div className="trainer-profile__avatar">
            {trainer.user.avatarUrl ? (
              <img
                src={trainer.user.avatarUrl}
                alt={`${trainer.user.firstName} ${trainer.user.lastName}`}
              />
            ) : (
              <span>
                {trainer.user.firstName.charAt(0)}
                {trainer.user.lastName.charAt(0)}
              </span>
            )}
          </div>

          <div className="trainer-profile__info">
            <p className="trainer-profile__eyebrow">
              TRENER PERSONALNY
            </p>

            <h1>
              {trainer.user.firstName}{' '}
              {trainer.user.lastName}
            </h1>

            {trainer.specialization && (
              <p className="trainer-profile__specialization">
                {trainer.specialization}
              </p>
            )}

            {trainer.bio && (
              <p className="trainer-profile__bio">
                {trainer.bio}
              </p>
            )}

            <div className="trainer-profile__details">
              {trainer.location && (
                <span>
                  <small>LOKALIZACJA</small>
                  {trainer.location}
                </span>
              )}

              {trainer.price && (
                <span>
                  <small>CENA</small>
                  {trainer.price} zł / trening
                </span>
              )}

              {trainer.durationMinutes && (
                <span>
                  <small>CZAS</small>
                  {trainer.durationMinutes} min
                </span>
              )}
            </div>
          </div>
        </section>

        {/* BOOKING */}

        <section className="trainer-availability">
          <div className="trainer-availability__header">
            <div>
              <p className="trainer-profile__eyebrow">
                DOSTĘPNOŚĆ
              </p>

              <h2>
                Wybierz termin treningu
              </h2>

              <p className="trainer-availability__description">
                Wybierz dzień, a następnie dogodną
                godzinę.
              </p>
            </div>

            <div className="trainer-date-picker">
              <label htmlFor="training-date">
                DATA TRENINGU
              </label>

              <input
                id="training-date"
                type="date"
                value={selectedDate}
                min={getTodayDate()}
                onChange={(event) =>
                  setSelectedDate(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          <div className="trainer-selected-date">
            {formatSelectedDate()}
          </div>

          {slotsLoading ? (
            <div className="trainer-slots-loading">
              <span />
              Pobieranie dostępnych godzin...
            </div>
          ) : slots.length === 0 ? (
            <div className="trainer-slots-empty">
              <div className="trainer-slots-empty__icon">
                —
              </div>

              <h3>
                Brak dostępnych terminów
              </h3>

              <p>
                Ten trener nie ma dostępnych godzin
                w wybranym dniu.
              </p>

              <p>
                Spróbuj wybrać inny dzień.
              </p>
            </div>
          ) : (
            <>
              <div className="trainer-availability__legend">
                <span>
                  <i className="legend-dot legend-dot--available" />
                  Dostępny
                </span>

                <span>
                  <i className="legend-dot legend-dot--booked" />
                  Zajęty
                </span>
              </div>

              <div className="trainer-availability__slots">
                {slots.map((slot) => {
                  const selected =
                    selectedSlot?.startTime ===
                      slot.startTime &&
                    selectedSlot?.endTime ===
                      slot.endTime

                  return (
                    <button
                      key={`${slot.startTime}-${slot.endTime}`}
                      type="button"
                      className={`availability-slot ${
                        slot.available
                          ? 'availability-slot--available'
                          : 'availability-slot--booked'
                      } ${
                        selected
                          ? 'availability-slot--selected'
                          : ''
                      }`}
                      disabled={!slot.available}
                      onClick={() =>
                        setSelectedSlot(slot)
                      }
                    >
                      <strong>
                        {slot.startTime}
                      </strong>

                      <span>
                        – {slot.endTime}
                      </span>

                      <small>
                        {slot.available
                          ? selected
                            ? 'Wybrany'
                            : 'Dostępny'
                          : 'Zajęty'}
                      </small>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {selectedSlot && (
            <div className="selected-slot">
              <div className="selected-slot__info">
                <p>WYBRANY TERMIN</p>

                <strong>
                  {formatSelectedDate()}
                </strong>

                <span>
                  {selectedSlot.startTime} –{' '}
                  {selectedSlot.endTime}
                </span>
              </div>

              <div className="selected-slot__action">
                {trainer.price && (
                  <span>
                    {trainer.price} zł
                  </span>
                )}

                <button
                  className="selected-slot__button"
                  onClick={handleBooking}
                  disabled={booking}
                >
                  {booking
                    ? 'Rezerwowanie...'
                    : 'Zarezerwuj trening'}
                </button>
              </div>
            </div>
          )}

          {bookingError && (
            <div className="booking-message booking-message--error">
              {bookingError}
            </div>
          )}

          {bookingSuccess && (
            <div className="booking-message booking-message--success">
              <strong>
                Trening został zarezerwowany.
              </strong>

              <span>
                Rezerwacja oczekuje teraz na
                potwierdzenie trenera.
              </span>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
              >
                Przejdź do dashboardu
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default TrainerPage