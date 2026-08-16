import { useEffect, useMemo, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  notifyFavoritesChanged,
  subscribeToFavoritesChanged,
} from '../utils/favoriteSync'
import './TrainerPage.css'

type Tab = 'booking' | 'reviews' | 'details'

interface Review {
  id: number
  rating: number
  comment: string | null
  createdAt: string
  client: {
    user: {
      firstName: string
      lastName: string
      avatarUrl: string | null
    }
  }
}

interface SocialLink {
  id: number
  platform: string
  url: string
}

interface Trainer {
  id: number
  bio: string | null
  specialization: string | null
  price: string | null
  durationMinutes: number | null
  location: string | null
  paymentPolicy: string | null
  cancellationPolicy: string | null

  user: {
    id: number
    firstName: string
    lastName: string
    avatarUrl: string | null
    email: string
    phone: string | null
  }

  socialLinks: SocialLink[]
  reviews: Review[]
}

interface ReviewSummary {
  averageRating: number | null
  reviewCount: number
}

interface Slot {
  startTime: string
  endTime: string
  available: boolean
}

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function dateToString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatPrice(price: string | null) {
  if (!price) {
    return '—'
  }

  return `${price.replace('.', ',')} zł`
}

function StarRating({
  rating,
  large = false,
}: {
  rating: number
  large?: boolean
}) {
  return (
    <div
      className={`star-rating ${
        large ? 'star-rating--large' : ''
      }`}
      aria-label={`Ocena ${rating} na 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${
            star <= Math.round(rating)
              ? 'star--active'
              : ''
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function TrainerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()

  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] =
    useState(false)

  const [trainer, setTrainer] =
    useState<Trainer | null>(null)

  const [reviewSummary, setReviewSummary] =
    useState<ReviewSummary>({
      averageRating: null,
      reviewCount: 0,
    })

  const [activeTab, setActiveTab] =
    useState<Tab>('booking')

  const [slots, setSlots] = useState<Slot[]>([])

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate())

  const [calendarMonth, setCalendarMonth] =
    useState(() => {
      const today = new Date()

      return new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      )
    })

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

  const [consumerInfoOpen, setConsumerInfoOpen] =
    useState(false)

  const [paymentInfoOpen, setPaymentInfoOpen] =
    useState(false)

  const [reportOpen, setReportOpen] =
    useState(false)

  const [reviewAppointmentId, setReviewAppointmentId] =
    useState<number | null>(null)

  const [reviewRating, setReviewRating] = useState(5)

  const [reviewComment, setReviewComment] =
    useState('')

  const [reviewError, setReviewError] =
    useState('')

  const [reviewSubmitting, setReviewSubmitting] =
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

        setReviewSummary(
          data.reviewSummary ?? {
            averageRating: null,
            reviewCount: 0,
          },
        )
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
    if (!id || !token) {
      setIsFavorite(false)
      return
    }

    async function fetchFavoriteStatus() {
      try {
        const response = await fetch(
          'http://localhost:3000/api/me/favorites',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.status === 401) {
          logout()
          return
        }

        if (!response.ok) {
          setIsFavorite(false)
          return
        }

        const data = await response.json()

        const favoriteExists =
          (data.favorites ?? []).some(
            (favorite: {
              trainer: {
                id: number
              }
            }) =>
              favorite.trainer.id === Number(id),
          )

        setIsFavorite(favoriteExists)
      } catch {
        setIsFavorite(false)
      }
    }

    fetchFavoriteStatus()
  }, [id, token, logout])

  /*
   * Synchronizacja serduszka z:
   * - listą trenerów
   * - zakładką Ulubione
   * - innymi otwartymi komponentami
   */
  useEffect(() => {
    return subscribeToFavoritesChanged(
      (trainerId, nextIsFavorite) => {
        if (trainerId !== Number(id)) {
          return
        }

        setIsFavorite(nextIsFavorite)
      },
    )
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

  async function openReviewForm() {
    const currentToken =
      localStorage.getItem('token')

    if (!currentToken) {
      navigate('/login')
      return
    }

    try {
      setReviewError('')

      const response = await fetch(
        'http://localhost:3000/api/me/reviewable-appointments',
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        },
      )

      if (response.status === 401) {
        navigate('/login')
        return
      }

      if (response.status === 403) {
        setReviewError(
          'Opinie mogą dodawać wyłącznie klienci.',
        )
        return
      }

      const data = await response.json()

      const appointment =
        data.appointments?.find(
          (item: {
            id: number
            trainer: {
              id: number
            }
          }) =>
            item.trainer.id === Number(id),
        )

      if (!appointment) {
        setReviewError(
          'Możesz dodać opinię po zakończonej wizycie z tym trenerem.',
        )
        return
      }

      setReviewAppointmentId(appointment.id)
    } catch {
      setReviewError(
        'Nie udało się sprawdzić możliwości dodania opinii.',
      )
    }
  }

  async function submitReview() {
    const currentToken =
      localStorage.getItem('token')

    if (
      !currentToken ||
      !reviewAppointmentId
    ) {
      return
    }

    try {
      setReviewSubmitting(true)
      setReviewError('')

      const response = await fetch(
        'http://localhost:3000/api/me/reviews',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            appointmentId: reviewAppointmentId,
            rating: reviewRating,
            comment: reviewComment,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setReviewError(
          data.message ??
            'Nie udało się dodać opinii.',
        )

        return
      }

      setReviewAppointmentId(null)
      setReviewComment('')

      window.location.reload()
    } catch {
      setReviewError(
        'Nie udało się dodać opinii.',
      )
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function toggleFavorite() {
    if (!id) {
      return
    }

    if (!token) {
      navigate('/login')
      return
    }

    if (favoriteLoading) {
      return
    }

    const trainerId = Number(id)

    setFavoriteLoading(true)

    try {
      const currentResponse = await fetch(
        'http://localhost:3000/api/me/favorites',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (currentResponse.status === 401) {
        logout()
        navigate('/login')
        return
      }

      if (!currentResponse.ok) {
        return
      }

      const currentData =
        await currentResponse.json()

      const currentlyFavorite =
        (currentData.favorites ?? []).some(
          (favorite: {
            trainer: {
              id: number
            }
          }) =>
            favorite.trainer.id === trainerId,
        )

      const response = await fetch(
        currentlyFavorite
          ? `http://localhost:3000/api/me/favorites/${trainerId}`
          : 'http://localhost:3000/api/me/favorites',
        {
          method: currentlyFavorite
            ? 'DELETE'
            : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            ...(currentlyFavorite
              ? {}
              : {
                  'Content-Type': 'application/json',
                }),
          },
          ...(currentlyFavorite
            ? {}
            : {
                body: JSON.stringify({
                  trainerId,
                }),
              }),
        },
      )

      if (!response.ok) {
        console.error(
          'Favorite request failed',
          response.status,
          await response.text(),
        )
        return
      }

      setIsFavorite(!currentlyFavorite)

      notifyFavoritesChanged(
        trainerId,
        !currentlyFavorite,
      )
    } catch (error) {
      console.error(error)
    } finally {
      setFavoriteLoading(false)
    }
  }

  async function handleBooking() {
    if (!selectedSlot || !trainer) {
      return
    }

    const currentToken = localStorage.getItem('token')

    if (!currentToken) {
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
            Authorization: `Bearer ${currentToken}`,
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

      if (!response.ok) {
        throw new Error(
          data.message || 'Nie udało się zarezerwować treningu.',
        )
      }

      setBookingSuccess(true)
      setSelectedSlot(null)

      navigate('/profile/visits')
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

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()

    const firstDay = new Date(
      year,
      month,
      1,
    )

    const lastDay = new Date(
      year,
      month + 1,
      0,
    )

    const firstWeekday =
      (firstDay.getDay() + 6) % 7

    const daysInMonth =
      lastDay.getDate()

    const days: Array<{
      date: Date
      currentMonth: boolean
    }> = []

    for (
      let i = firstWeekday - 1;
      i >= 0;
      i--
    ) {
      days.push({
        date: new Date(
          year,
          month,
          -i,
        ),
        currentMonth: false,
      })
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push({
        date: new Date(
          year,
          month,
          day,
        ),
        currentMonth: true,
      })
    }

    let nextDay = 1

    while (days.length < 42) {
      days.push({
        date: new Date(
          year,
          month + 1,
          nextDay,
        ),
        currentMonth: false,
      })

      nextDay++
    }

    return days
  }, [calendarMonth])

  function selectCalendarDate(date: Date) {
    const dateString = dateToString(date)

    if (dateString < getTodayDate()) {
      return
    }

    setSelectedDate(dateString)

    if (
      date.getMonth() !==
      calendarMonth.getMonth()
    ) {
      setCalendarMonth(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1,
        ),
      )
    }
  }

  function goToPreviousMonth() {
    const today = new Date()

    const previousMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() - 1,
      1,
    )

    const currentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    )

    if (previousMonth < currentMonth) {
      return
    }

    setCalendarMonth(previousMonth)
  }

  function goToNextMonth() {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + 1,
        1,
      ),
    )
  }

  function formatMonth() {
    return new Intl.DateTimeFormat(
      'pl-PL',
      {
        month: 'long',
        year: 'numeric',
      },
    ).format(calendarMonth)
  }

  function formatSelectedDate() {
    if (!selectedDate) {
      return ''
    }

    return new Intl.DateTimeFormat(
      'pl-PL',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    ).format(
      new Date(
        `${selectedDate}T12:00:00`,
      ),
    )
  }

  function formatReviewDate(date: string) {
    return new Intl.DateTimeFormat(
      'pl-PL',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    ).format(new Date(date))
  }

  function openTab(tab: Tab) {
    setActiveTab(tab)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
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
          {error ||
            'Nie znaleziono trenera.'}
        </div>
      </main>
    )
  }

  return (
    <main className="trainer-page">
      <div className="trainer-page__container">
        <section className="trainer-profile">
          <div className="trainer-profile__avatar">
            {trainer.user.avatarUrl ? (
              <img
                src={trainer.user.avatarUrl}
                alt={`${trainer.user.firstName} ${trainer.user.lastName}`}
              />
            ) : (
              <svg
                className="trainer-profile__avatar-icon"
                viewBox="0 0 64 64"
                aria-hidden="true"
              >
                <circle
                  cx="32"
                  cy="20"
                  r="10"
                />

                <path d="M14 55c1.5-12 8-19 18-19s16.5 7 18 19" />
              </svg>
            )}
          </div>

          <button
            type="button"
            className={`trainer-profile__favorite ${
              isFavorite
                ? 'trainer-profile__favorite--active'
                : ''
            }`}
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            aria-label={
              isFavorite
                ? 'Usuń trenera z ulubionych'
                : 'Dodaj trenera do ulubionych'
            }
            aria-pressed={isFavorite}
            title={
              isFavorite
                ? 'Usuń z ulubionych'
                : 'Dodaj do ulubionych'
            }
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M20.8 8.7c0 5.2-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.7C3.2 5.9 5.1 4 7.7 4c1.7 0 3.3.9 4.3 2.2C13 4.9 14.6 4 16.3 4c2.6 0 4.5 1.9 4.5 4.7Z"
                fill={
                  isFavorite
                    ? 'currentColor'
                    : 'none'
                }
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

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

            {reviewSummary.averageRating !==
              null && (
              <div className="trainer-profile__rating">
                <StarRating
                  rating={
                    reviewSummary.averageRating
                  }
                />

                <strong>
                  {reviewSummary.averageRating.toFixed(
                    1,
                  )}
                </strong>

                <span>
                  ({reviewSummary.reviewCount}{' '}
                  {reviewSummary.reviewCount ===
                  1
                    ? 'opinia'
                    : 'opinii'}
                  )
                </span>
              </div>
            )}

            <div className="trainer-profile__details">
              {trainer.location && (
                <div className="trainer-profile__detail">
                  <div className="trainer-profile__detail-icon">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 21s7-6.2 7-12A7 7 0 0 0 5 9c0 5.8 7 12 7 12Z" />

                      <circle
                        cx="12"
                        cy="9"
                        r="2.5"
                      />
                    </svg>
                  </div>

                  <div>
                    <small>
                      LOKALIZACJA
                    </small>

                    <strong>
                      {trainer.location}
                    </strong>
                  </div>
                </div>
              )}

              {trainer.price && (
                <div className="trainer-profile__detail">
                  <div className="trainer-profile__detail-icon">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 3v18" />

                      <path d="M16.5 7.5c0-1.7-1.8-3-4.5-3S7.5 5.8 7.5 8s1.8 3 4.5 3 4.5 1.3 4.5 3-1.8 3-4.5 3-4.5-1.3-4.5-3" />
                    </svg>
                  </div>

                  <div>
                    <small>
                      CENA
                    </small>

                    <strong>
                      {formatPrice(
                        trainer.price,
                      )}
                    </strong>
                  </div>
                </div>
              )}

              {trainer.durationMinutes && (
                <div className="trainer-profile__detail">
                  <div className="trainer-profile__detail-icon">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="8.5"
                      />

                      <path d="M12 7v5l3.5 2" />
                    </svg>
                  </div>

                  <div>
                    <small>
                      CZAS
                    </small>

                    <strong>
                      {trainer.durationMinutes}{' '}
                      min
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <nav className="trainer-tabs">
          <button
            type="button"
            className={`trainer-tab ${
              activeTab === 'booking'
                ? 'trainer-tab--active'
                : ''
            }`}
            onClick={() =>
              openTab('booking')
            }
          >
            Wybierz termin
          </button>

          <button
            type="button"
            className={`trainer-tab ${
              activeTab === 'reviews'
                ? 'trainer-tab--active'
                : ''
            }`}
            onClick={() =>
              openTab('reviews')
            }
          >
            Opinie

            <span>
              {reviewSummary.reviewCount}
            </span>
          </button>

          <button
            type="button"
            className={`trainer-tab ${
              activeTab === 'details'
                ? 'trainer-tab--active'
                : ''
            }`}
            onClick={() =>
              openTab('details')
            }
          >
            Szczegóły
          </button>
        </nav>

        {activeTab === 'booking' && (
          <section className="trainer-section trainer-booking">
            <div className="booking-header">
              <p className="trainer-profile__eyebrow">
                DOSTĘPNOŚĆ
              </p>

              <h2>
                Wybierz termin treningu
              </h2>

              <p>
                Wybierz dzień, a następnie dogodną
                godzinę.
              </p>
            </div>

            <div className="booking-calendar">
              <div className="booking-calendar__header">
                <h3>
                  {formatMonth()}
                </h3>

                <div className="booking-calendar__navigation">
                  <button
                    type="button"
                    onClick={
                      goToPreviousMonth
                    }
                    aria-label="Poprzedni miesiąc"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={
                      goToNextMonth
                    }
                    aria-label="Następny miesiąc"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="booking-calendar__weekdays">
                <span>PON</span>
                <span>WT</span>
                <span>ŚR</span>
                <span>CZW</span>
                <span>PT</span>
                <span>SOB</span>
                <span>NIEDZ</span>
              </div>

              <div className="booking-calendar__grid">
                {calendarDays.map(
                  ({
                    date,
                    currentMonth,
                  }) => {
                    const dateString =
                      dateToString(date)

                    const isPast =
                      dateString <
                      getTodayDate()

                    const isSelected =
                      dateString ===
                      selectedDate

                    return (
                      <button
                        key={dateString}
                        type="button"
                        className={`calendar-day ${
                          !currentMonth
                            ? 'calendar-day--muted'
                            : ''
                        } ${
                          isSelected
                            ? 'calendar-day--selected'
                            : ''
                        }`}
                        disabled={isPast}
                        onClick={() =>
                          selectCalendarDate(
                            date,
                          )
                        }
                      >
                        {date.getDate()}
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            <div className="booking-times">
              <div className="booking-times__heading">
                <h3>
                  {formatSelectedDate()}
                </h3>

                <span className="booking-times__hint">
                  Wybierz godzinę
                </span>
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
                    Ten trener nie ma dostępnych
                    godzin w wybranym dniu.
                  </p>

                  <p>
                    Spróbuj wybrać inny dzień.
                  </p>
                </div>
              ) : (
                <div className="booking-time-list">
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
                        disabled={
                          !slot.available
                        }
                        className={`booking-time ${
                          slot.available
                            ? 'booking-time--available'
                            : 'booking-time--booked'
                        } ${
                          selected
                            ? 'booking-time--selected'
                            : ''
                        }`}
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
              )}
            </div>

            {selectedSlot && (
              <div className="booking-summary">
                <div className="booking-summary__service">
                  <span className="booking-summary__label">
                    WYBRANY TRENING
                  </span>

                  <h3>
                    Trening personalny
                  </h3>

                  <p>
                    {formatSelectedDate()} ·{' '}
                    {selectedSlot.startTime} –{' '}
                    {selectedSlot.endTime}
                  </p>
                </div>

                <div className="booking-summary__checkout">
                  <div>
                    <strong>
                      {formatPrice(
                        trainer.price,
                      )}
                    </strong>

                    <span>
                      {trainer.durationMinutes}{' '}
                      min
                    </span>
                  </div>

                  <button
                    type="button"
                    className="selected-slot__button"
                    onClick={
                      handleBooking
                    }
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
                  onClick={() =>
                    navigate('/dashboard')
                  }
                >
                  Przejdź do dashboardu
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'reviews' && (
          <section className="trainer-section trainer-reviews">
            <div className="trainer-section__title">
              <p className="trainer-profile__eyebrow">
                OPINIE
              </p>

              <h2>
                Opinie klientów
              </h2>

              <p>
                Sprawdź doświadczenia osób, które
                trenowały z tym trenerem.
              </p>
            </div>

            <div className="review-summary">
              <div className="review-summary__score">
                <strong>
                  {reviewSummary.averageRating !==
                  null
                    ? reviewSummary.averageRating.toFixed(
                        1,
                      )
                    : '—'}
                </strong>

                {reviewSummary.averageRating !==
                  null && (
                  <StarRating
                    rating={
                      reviewSummary.averageRating
                    }
                    large
                  />
                )}

                <span>
                  {reviewSummary.reviewCount}{' '}
                  {reviewSummary.reviewCount ===
                  1
                    ? 'opinia'
                    : 'opinii'}
                </span>
              </div>

              <div className="review-summary__text">
                <strong>
                  Ocena trenera
                </strong>

                <span>
                  Średnia ocena na podstawie opinii
                  klientów.
                </span>
              </div>
            </div>

            {trainer.reviews.length === 0 ? (
              <div className="reviews-empty">
                <h3>
                  Brak opinii
                </h3>

                <p>
                  Ten trener nie ma jeszcze żadnych
                  opinii.
                </p>
              </div>
            ) : (
              <div className="reviews-list">
                {trainer.reviews.map(
                  (review) => (
                    <article
                      className="review-card"
                      key={review.id}
                    >
                      <div className="review-card__header">
                        <div className="review-card__user">
                          <div className="review-card__avatar">
                            {review.client.user
                              .avatarUrl ? (
                              <img
                                src={
                                  review.client
                                    .user
                                    .avatarUrl
                                }
                                alt=""
                              />
                            ) : (
                              <>
                                {review.client.user.firstName.charAt(
                                  0,
                                )}
                                {review.client.user.lastName.charAt(
                                  0,
                                )}
                              </>
                            )}
                          </div>

                          <div>
                            <strong>
                              {
                                review.client
                                  .user
                                  .firstName
                              }{' '}
                              {
                                review.client
                                  .user
                                  .lastName
                              }
                            </strong>

                            <span>
                              {formatReviewDate(
                                review.createdAt,
                              )}
                            </span>
                          </div>
                        </div>

                        <StarRating
                          rating={
                            review.rating
                          }
                        />
                      </div>

                      {review.comment && (
                        <p>
                          {review.comment}
                        </p>
                      )}
                    </article>
                  ),
                )}
              </div>
            )}

            <div className="review-action">
              <div>
                <h3>
                  Oceń trenera
                </h3>

                <p>
                  Korzystałeś z usług tego trenera?
                  Podziel się swoją opinią.
                </p>
              </div>

              <button
                type="button"
                className="review-action__button"
                onClick={openReviewForm}
              >
                Dodaj opinię
              </button>
            </div>

            {reviewError &&
              !reviewAppointmentId && (
                <p className="review-action__error">
                  {reviewError}
                </p>
              )}

            {reviewAppointmentId && (
              <div className="review-form">
                <h3>Dodaj opinię</h3>

                <p>
                  Oceń swoje doświadczenie z trenerem.
                </p>

                <div
                  className="review-form__stars"
                  aria-label="Ocena"
                >
                  {[1, 2, 3, 4, 5].map(
                    (rating) => (
                      <button
                        type="button"
                        key={rating}
                        onClick={() =>
                          setReviewRating(
                            rating,
                          )
                        }
                        aria-label={`${rating} gwiazdek`}
                        className={
                          rating <=
                          reviewRating
                            ? 'is-selected'
                            : ''
                        }
                      >
                        ★
                      </button>
                    ),
                  )}
                </div>

                <label htmlFor="review-comment">
                  Komentarz (opcjonalnie)
                </label>

                <textarea
                  id="review-comment"
                  maxLength={2000}
                  value={reviewComment}
                  onChange={(event) =>
                    setReviewComment(
                      event.target.value,
                    )
                  }
                  placeholder="Napisz, jak przebiegła współpraca."
                />

                {reviewError && (
                  <p className="review-action__error">
                    {reviewError}
                  </p>
                )}

                <div className="review-form__actions">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewAppointmentId(
                        null,
                      )
                    }
                  >
                    Anuluj
                  </button>

                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={
                      reviewSubmitting
                    }
                  >
                    {reviewSubmitting
                      ? 'Wysyłanie…'
                      : 'Opublikuj opinię'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'details' && (
          <section className="trainer-section trainer-details">
            <div className="trainer-section__title">
              <p className="trainer-profile__eyebrow">
                INFORMACJE
              </p>

              <h2>
                Szczegóły
              </h2>

              <p>
                Wszystkie najważniejsze informacje
                dotyczące współpracy.
              </p>
            </div>

            <div className="details-list">
              <article className="details-card">
                <span className="details-card__label">
                  O MNIE
                </span>

                <p>
                  {trainer.bio ||
                    'Trener nie dodał jeszcze opisu.'}
                </p>
              </article>

              <article className="details-card">
                <span className="details-card__label">
                  KONTAKT
                </span>

                <div className="details-contact">
                  <a
                    className="contact-row"
                    href={`mailto:${trainer.user.email}`}
                  >
                    <span>
                      Email
                    </span>

                    <strong>
                      {trainer.user.email}
                    </strong>
                  </a>

                  {trainer.user.phone && (
                    <a
                      className="contact-row"
                      href={`tel:${trainer.user.phone}`}
                    >
                      <span>
                        Telefon
                      </span>

                      <strong>
                        {trainer.user.phone}
                      </strong>
                    </a>
                  )}
                </div>
              </article>

              <article className="details-card">
                <span className="details-card__label">
                  SOCIAL MEDIA
                </span>

                {trainer.socialLinks.length ===
                0 ? (
                  <p className="details-muted">
                    Trener nie dodał jeszcze żadnych
                    profili społecznościowych.
                  </p>
                ) : (
                  <div className="social-links">
                    {trainer.socialLinks.map(
                      (social) => (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noreferrer"
                          className="social-link"
                        >
                          <span className="social-link__icon">
                            {social.platform
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>

                          <span>
                            {social.platform}
                          </span>
                        </a>
                      ),
                    )}
                  </div>
                )}
              </article>

              <div
                className={`details-accordion ${
                  paymentInfoOpen
                    ? 'details-accordion--open'
                    : ''
                }`}
              >
                <button
                  type="button"
                  className="details-accordion__header"
                  onClick={() =>
                    setPaymentInfoOpen(
                      !paymentInfoOpen,
                    )
                  }
                >
                  <div>
                    <span className="details-card__label">
                      Zasady płatności i anulowania wizyty
                    </span>
                  </div>

                  <span className="details-accordion__arrow">
                    →
                  </span>
                </button>

                <div className="details-accordion__content">
                  <div className="details-text">
                    <p>
                      Zasady płatności oraz warunki
                      anulowania wizyty ustalane są
                      przez trenera.
                    </p>

                    {trainer.paymentPolicy && (
                      <p>
                        {trainer.paymentPolicy}
                      </p>
                    )}

                    {trainer.cancellationPolicy && (
                      <p>
                        {trainer.cancellationPolicy}
                      </p>
                    )}

                    {!trainer.paymentPolicy &&
                      !trainer.cancellationPolicy && (
                        <p className="details-muted">
                          Trener nie dodał jeszcze
                          szczegółowych zasad płatności
                          ani anulowania wizyty.
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <div
                className={`details-accordion details-accordion--consumer ${
                  consumerInfoOpen
                    ? 'details-accordion--open'
                    : ''
                }`}
              >
                <button
                  type="button"
                  className="details-accordion__header"
                  onClick={() =>
                    setConsumerInfoOpen(
                      !consumerInfoOpen,
                    )
                  }
                >
                  <div>
                    <span className="details-card__label">
                      Informacje dla konsumentów
                    </span>
                  </div>

                  <span className="details-accordion__arrow">
                    →
                  </span>
                </button>

                <div className="details-accordion__content">
                  <div className="consumer-info">
                    <p>
                      PROGREFY udostępnia internetową
                      platformę do rezerwacji usług
                      treningowych i umożliwia Ci
                      zawarcie umowy z wybranym
                      trenerem.
                    </p>

                    <p>
                      PROGREFY nie jest stroną umowy
                      zawieranej pomiędzy klientem a
                      trenerem. Za wykonanie
                      zarezerwowanej usługi odpowiada
                      trener jako jej wykonawca.
                    </p>

                    <p>
                      Przed dokonaniem rezerwacji
                      zapoznaj się z informacjami
                      dotyczącymi usługi, ceną,
                      dostępnością oraz zasadami
                      anulowania wizyty.
                    </p>

                    <p>
                      Szczegółowe informacje dotyczące
                      korzystania z platformy znajdziesz
                      w{' '}
                      <Link
                        to="/regulamin"
                        className="consumer-info__link"
                      >
                        Regulaminie PROGREFY
                      </Link>
                      .
                    </p>

                    <p>
                      Jeżeli masz problem dotyczący
                      działania platformy, możesz
                      skontaktować się z naszym
                      zespołem pomocy.
                    </p>

                    <p>
                      W przypadku problemu dotyczącego
                      samej usługi treningowej w pierwszej
                      kolejności skontaktuj się z
                      trenerem.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`details-accordion details-accordion--report ${
                  reportOpen
                    ? 'details-accordion--open'
                    : ''
                }`}
              >
                <button
                  type="button"
                  className="details-accordion__header"
                  onClick={() =>
                    setReportOpen(
                      !reportOpen,
                    )
                  }
                >
                  <div>
                    <span className="details-card__label">
                      Zgłoś
                    </span>
                  </div>

                  <span className="details-accordion__arrow">
                    →
                  </span>
                </button>

                <div className="details-accordion__content">
                  <div className="details-text">
                    <p>
                      Jeżeli zauważyłeś problem,
                      nieprawidłowość lub zachowanie,
                      które narusza zasady PROGREFY,
                      możesz zgłosić je naszemu zespołowi.
                    </p>

                    <Link
                      className="report-button"
                      to={`/trainers/${id}/report`}
                    >
                      Przejdź do formularza zgłoszenia
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default TrainerPage