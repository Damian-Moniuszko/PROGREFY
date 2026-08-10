import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

function TrainerPage() {
  const { id } = useParams()

  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState('2026-08-17')
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    async function fetchTrainer() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/trainers/${id}`,
        )

        if (!response.ok) {
          throw new Error('Trainer not found')
        }

        const data = await response.json()

        setTrainer(data.trainer)
      } catch {
        setError('Nie udało się pobrać profilu trenera.')
      } finally {
        setLoading(false)
      }
    }

    fetchTrainer()
  }, [id])

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/trainers/${id}/slots?date=${selectedDate}`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch slots')
        }

        const data = await response.json()

        setSlots(data.slots)
      } catch {
        setSlots([])
      }
    }

    fetchSlots()
  }, [id, selectedDate])

  if (loading) {
    return (
      <main className="trainer-page">
        <p>Ładowanie profilu...</p>
      </main>
    )
  }

  if (error || !trainer) {
    return (
      <main className="trainer-page">
        <p>{error || 'Nie znaleziono trenera.'}</p>
      </main>
    )
  }

  async function handleBooking() {
    if (!selectedSlot || !trainer) {
        return
    }

    const token = localStorage.getItem('token')

    if (!token) {
        window.location.href = '/login'
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

        if (!response.ok) {
        throw new Error(
            data.message || 'Nie udało się zarezerwować treningu.',
        )
        }

        setBookingSuccess(true)
        setSelectedSlot(null)

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

  return (
    <main className="trainer-page">
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
              <span>📍 {trainer.location}</span>
            )}

            {trainer.price && (
              <span>💰 {trainer.price} zł / trening</span>
            )}

            {trainer.durationMinutes && (
              <span>
                ⏱️ {trainer.durationMinutes} min
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="trainer-availability">
        <div className="trainer-availability__header">
          <div>
            <p className="trainer-profile__eyebrow">
              DOSTĘPNOŚĆ
            </p>

            <h2>Wybierz termin treningu</h2>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(event.target.value)
            }
          />
        </div>

        <div className="trainer-availability__slots">
            {slots.map((slot) => (
                <button
                key={`${slot.startTime}-${slot.endTime}`}
                className={`availability-slot ${
                    slot.available
                    ? 'availability-slot--available'
                    : 'availability-slot--booked'
                } ${
                    selectedSlot?.startTime === slot.startTime
                    ? 'availability-slot--selected'
                    : ''
                }`}
                disabled={!slot.available}
                onClick={() => {
                    if (slot.available) {
                    setSelectedSlot(slot)
                    }
                }}
                >
                <span>{slot.startTime}</span>
                <span>–</span>
                <span>{slot.endTime}</span>

                <small>
                    {slot.available
                    ? 'Dostępny'
                    : 'Zajęty'}
                </small>
            </button>
          ))}
        </div>
        {selectedSlot && (
        <div className="selected-slot">
            <div>
            <p>WYBRANY TERMIN</p>

            <strong>
                {selectedDate} · {selectedSlot.startTime} –{' '}
                {selectedSlot.endTime}
            </strong>
            </div>

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
        )}

        {bookingError && (
            <p className="booking-message booking-message--error">
                {bookingError}
            </p>
            )}

            {bookingSuccess && (
            <p className="booking-message booking-message--success">
                Trening został zarezerwowany.
            </p>
        )}
      </section>
    </main>
  )
}

export default TrainerPage