import { useEffect, useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAppointmentStatusLabel } from '../utils/appointmentStatus'
import {
  notifyFavoritesChanged,
  subscribeToFavoritesChanged,
} from '../utils/favoriteSync'
import './ProfileSectionPage.css'
import PaymentsSection from '../components/profile/PaymentsSection'

interface Appointment {
  id: number
  startAt: string
  endAt: string
  price: string
  status: string

  payment: {
    id: number
    amount: string
    status: string
    method: string
    provider: string
    providerPaymentId: string | null
  } | null

  review: {
    id: number
    rating: number
    comment: string | null
    createdAt: string
  } | null

  trainer: {
    id: number
    user: {
      firstName: string
      lastName: string
      avatarUrl: string | null
    }
  }
}

interface Review {
  id: number
  rating: number
  comment: string | null
  createdAt: string
  trainer: {
    user: {
      firstName: string
      lastName: string
      avatarUrl: string | null
    }
  }
}

interface FavoriteTrainer {
  id: number
  createdAt: string

  trainer: {
    id: number
    bio: string | null
    specialization: string | null
    price: string | null
    durationMinutes: number | null
    location: string | null

    user: {
      firstName: string
      lastName: string
      avatarUrl: string | null
    }
  }
}

const sectionMap: Record<
  string,
  {
    title: string
    description: string
  }
> = {
  favorites: {
    title: 'Ulubione',
    description:
      'Tutaj znajdziesz zapisanych przez Ciebie trenerów.',
  },

  settings: {
    title: 'Ustawienia konta',
    description:
      'Tutaj będziemy zarządzać danymi osobowymi, zdjęciem i ustawieniami konta.',
  },

  reviews: {
    title: 'Opinie',
    description:
      'Tutaj znajdziesz opinie i oceny wystawione przez Ciebie.',
  },

  payments: {
    title: 'Płatności',
    description:
      'Tutaj znajdziesz historię płatności i szczegóły transakcji.',
  },

  privacy: {
    title: 'Polityka prywatności',
    description:
      'Administrator: [pełna nazwa przedsiębiorcy], [adres], NIP: [NIP], e-mail: [adres e-mail]. Przetwarzamy dane konta, rezerwacji i płatności, aby świadczyć usługi Platformy, zapewniać bezpieczeństwo i realizować obowiązki prawne. Masz prawo dostępu, sprostowania, usunięcia, ograniczenia, przenoszenia danych i wniesienia skargi do Prezesa UODO.',
  },
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    'pl-PL',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(new Date(date))
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat(
    'pl-PL',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(new Date(date))
}

function formatPrice(price: string) {
  return `${Number(price)
    .toFixed(2)
    .replace('.', ',')} zł`
}

function getInitials(
  firstName: string,
  lastName: string,
) {
  return `${firstName.charAt(0)}${lastName.charAt(
    0,
  )}`
}

function getPaymentMethodLabel(method?: string) {
  switch (method) {
    case 'CARD':
      return '💳 Karta'

    case 'APPLE_PAY':
      return ' Apple Pay'

    case 'GOOGLE_PAY':
      return 'Google Pay'

    case 'CASH':
      return '💵 Gotówka u trenera'

    default:
      return 'Brak danych'
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'profile-appointment-status--confirmed'

    case 'PENDING':
      return 'profile-appointment-status--pending'

    case 'COMPLETED':
      return 'profile-appointment-status--completed'

    case 'CANCELLED':
      return 'profile-appointment-status--cancelled'

    default:
      return ''
  }
}

function HeartIcon({
  filled = false,
}: {
  filled?: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="profile-favorite-card__heart-icon"
    >
      <path
        d="M20.8 8.7c0 5.2-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.7C3.2 5.9 5.1 4 7.7 4c1.7 0 3.3.9 4.3 2.2C13 4.9 14.6 4 16.3 4c2.6 0 4.5 1.9 4.5 4.7Z"
        fill={
          filled
            ? 'currentColor'
            : 'none'
        }
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AppointmentCard({
  appointment,
  missed = false,
}: {
  appointment: Appointment
  missed?: boolean
}) {
  const trainerName = `${appointment.trainer.user.firstName} ${appointment.trainer.user.lastName}`

  return (
    <article
      className={`profile-appointment${
        missed
          ? ' profile-appointment--missed'
          : ''
      }`}
    >
      <div className="profile-appointment__top">
        <div className="profile-appointment__trainer">
          <div className="profile-appointment__avatar">
            {appointment.trainer.user
              .avatarUrl ? (
              <img
                src={
                  appointment.trainer.user
                    .avatarUrl
                }
                alt={trainerName}
              />
            ) : (
              getInitials(
                appointment.trainer.user
                  .firstName,
                appointment.trainer.user
                  .lastName,
              )
            )}
          </div>

          <div className="profile-appointment__trainer-info">
            <p className="profile-appointment__eyebrow">
              TRENER PERSONALNY
            </p>

            <h3>{trainerName}</h3>
          </div>
        </div>

        <div className="profile-appointment__status">
          <span
            className={`profile-appointment-status ${getStatusClass(
              appointment.status,
            )}`}
          >
            {missed
              ? 'NIEDOSZŁA'
              : getAppointmentStatusLabel(
                  appointment.status,
                )}
          </span>
        </div>
      </div>

      <div className="profile-appointment__details">
        <div className="profile-appointment__detail">
          <span>DATA</span>

          <strong>
            {formatDate(
              appointment.startAt,
            )}
          </strong>
        </div>

        <div className="profile-appointment__detail">
          <span>GODZINA</span>

          <strong>
            {formatTime(
              appointment.startAt,
            )}{' '}
            –{' '}
            {formatTime(
              appointment.endAt,
            )}
          </strong>
        </div>

        <div className="profile-appointment__detail">
          <span>CENA</span>

          <strong>
            {formatPrice(
              appointment.price,
            )}
          </strong>
        </div>

        <div className="profile-appointment__detail">
          <span>PŁATNOŚĆ</span>

          <strong>
            {getPaymentMethodLabel(
              appointment.payment?.method,
            )}
          </strong>
        </div>
      </div>
    </article>
  )
}

function FavoriteCard({
  favorite,
  onRemove,
}: {
  favorite: FavoriteTrainer
  onRemove: (trainerId: number) => void
}) {
  const trainer = favorite.trainer

  const name = `${trainer.user.firstName} ${trainer.user.lastName}`

  return (
    <article className="profile-favorite-card">
      <Link
        to={`/trainers/${trainer.id}`}
        className="profile-favorite-card__main"
      >
        <div className="profile-favorite-card__avatar">
          {trainer.user.avatarUrl ? (
            <img
              src={
                trainer.user.avatarUrl
              }
              alt={name}
            />
          ) : (
            getInitials(
              trainer.user.firstName,
              trainer.user.lastName,
            )
          )}
        </div>

        <div className="profile-favorite-card__content">
          <p className="profile-favorite-card__eyebrow">
            TRENER PERSONALNY
          </p>

          <h3>{name}</h3>

          {trainer.specialization && (
            <p className="profile-favorite-card__specialization">
              {trainer.specialization}
            </p>
          )}

          <div className="profile-favorite-card__meta">
            {trainer.location && (
              <span>
                {trainer.location}
              </span>
            )}

            {trainer.price && (
              <span>
                {formatPrice(
                  trainer.price,
                )}
              </span>
            )}

            {trainer.durationMinutes && (
              <span>
                {trainer.durationMinutes} min
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        className="profile-favorite-card__remove"
        onClick={() =>
          onRemove(trainer.id)
        }
        aria-label={`Usuń ${name} z ulubionych`}
        title="Usuń z ulubionych"
      >
        <HeartIcon filled />
      </button>
    </article>
  )
}


function ReviewsSection() {
  const { token } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          'http://localhost:3000/api/me/reviews',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        const data = await response.json()
        setReviews(data.reviews ?? [])
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [token])

  return (
    <main className="profile-section-page">
      <div className="profile-section-page__container">
        <Link to="/profile" className="profile-section-page__back">
          ← Profil
        </Link>

        <p className="profile-section-page__eyebrow">PROFIL</p>
        <h1>Opinie</h1>
        <p className="profile-section-page__description">
          Tutaj znajdziesz opinie i oceny wystawione przez Ciebie.
        </p>

        {loading ? (
          <p className="profile-reviews__empty">Ładowanie...</p>
        ) : reviews.length === 0 ? (
          <div className="profile-reviews__empty">
            Brak wystawionych opinii.
          </div>
        ) : (
          <div className="profile-reviews">
            {reviews.map((review) => {
              const name =
                `${review.trainer.user.firstName} ${review.trainer.user.lastName}`

              return (
                <article key={review.id} className="profile-review-card">
                  <div className="profile-review-card__top">

                    <div className="profile-review-card__trainer">

                      <div className="profile-review-card__avatar">
                        {review.trainer.user.avatarUrl ? (
                          <img
                            src={review.trainer.user.avatarUrl}
                            alt={name}
                          />
                        ) : (
                          getInitials(
                            review.trainer.user.firstName,
                            review.trainer.user.lastName,
                          )
                        )}
                      </div>

                      <h3>{name}</h3>

                    </div>

                    <span>
                      {'★'.repeat(review.rating)}
                    </span>

                  </div>

                  {review.comment && (
                    <p>{review.comment}</p>
                  )}

                  <small>
                    {formatDate(review.createdAt)}
                  </small>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

function FavoritesSection() {
  const navigate = useNavigate()

  const {
    user,
    token,
    logout,
    loading: authLoading,
  } = useAuth()

  const [favorites, setFavorites] =
    useState<FavoriteTrainer[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user || !token) {
      setLoading(false)
      return
    }

    if (user.role !== 'CLIENT') {
      setLoading(false)
      return
    }

    async function fetchFavorites() {
      try {
        setLoading(true)
        setError('')

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
          navigate('/login')
          return
        }

        if (!response.ok) {
          throw new Error(
            'Nie udało się pobrać ulubionych trenerów.',
          )
        }

        const data =
          await response.json()

        setFavorites(
          data.favorites ?? [],
        )
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Wystąpił błąd podczas pobierania ulubionych.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [
    authLoading,
    user,
    token,
    logout,
    navigate,
  ])

  /*
   * Synchronizacja z profilem trenera
   * oraz listą trenerów.
   *
   * Jeżeli trener zostanie usunięty
   * z ulubionych w innym miejscu,
   * usuwamy go również tutaj.
   */
  useEffect(() => {
    return subscribeToFavoritesChanged(
      (trainerId, isFavorite) => {
        if (isFavorite) {
          return
        }

        setFavorites((current) =>
          current.filter(
            (favorite) =>
              favorite.trainer.id !==
              trainerId,
          ),
        )
      },
    )
  }, [])

  async function removeFavorite(
    trainerId: number,
  ) {
    if (!token) {
      navigate('/login')
      return
    }

    const previousFavorites =
      favorites

    /*
     * Natychmiastowe usunięcie karty.
     */
    setFavorites((current) =>
      current.filter(
        (favorite) =>
          favorite.trainer.id !==
          trainerId,
      ),
    )

    try {
      const response = await fetch(
        `http://localhost:3000/api/me/favorites/${trainerId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.status === 401) {
        logout()
        navigate('/login')
        return
      }

      if (!response.ok) {
        throw new Error(
          'Nie udało się usunąć trenera z ulubionych.',
        )
      }

      /*
       * Informujemy pozostałe komponenty,
       * że trener nie jest już ulubiony.
       */
      notifyFavoritesChanged(
        trainerId,
        false,
      )
    } catch (error) {
      /*
       * Jeżeli request się nie udał,
       * przywracamy kartę.
       */
      setFavorites(
        previousFavorites,
      )

      setError(
        error instanceof Error
          ? error.message
          : 'Nie udało się usunąć trenera z ulubionych.',
      )
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="profile-section-page">
        <div className="profile-section-page__container">
          <Link
            to="/profile"
            className="profile-section-page__back"
          >
            ← Profil
          </Link>

          <p className="profile-section-page__eyebrow">
            PROFIL
          </p>

          <h1>Ulubione</h1>

          <p className="profile-section-page__description">
            Ładowanie zapisanych trenerów...
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (user.role !== 'CLIENT') {
    return (
      <main className="profile-section-page">
        <div className="profile-section-page__container">
          <Link
            to="/profile"
            className="profile-section-page__back"
          >
            ← Profil
          </Link>

          <p className="profile-section-page__eyebrow">
            PROFIL
          </p>

          <h1>Ulubione</h1>

          <p className="profile-section-page__description">
            Ulubieni trenerzy są dostępni dla kont klientów.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="profile-section-page">
      <div className="profile-section-page__container">
        <Link
          to="/profile"
          className="profile-section-page__back"
        >
          ← Profil
        </Link>

        <header className="profile-section-page__header">
          <p className="profile-section-page__eyebrow">
            PROFIL
          </p>

          <h1>Ulubione</h1>

          <p className="profile-section-page__description">
            Twoi zapisani trenerzy. Kliknij w profil,
            aby zobaczyć szczegóły lub zarezerwować trening.
          </p>
        </header>

        {error && (
          <div className="profile-section-page__error">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="profile-favorites__empty">
            <div className="profile-favorites__empty-icon">
              <HeartIcon />
            </div>

            <h2>
              Nie masz jeszcze ulubionych trenerów
            </h2>

            <p>
              Przeglądaj profile trenerów i dodaj tych,
              do których chcesz szybko wracać.
            </p>

            <Link
              to="/trainers"
              className="profile-visits__button"
            >
              Znajdź trenera
            </Link>
          </div>
        ) : (
          <section className="profile-favorites">
            <div className="profile-favorites__header">
              <div>
                <p className="profile-visits__eyebrow">
                  ZAPISANI
                </p>

                <h2>
                  Twoi ulubieni trenerzy
                </h2>
              </div>

              <span className="profile-visits__count">
                {favorites.length}
              </span>
            </div>

            <div className="profile-favorites__list">
              {favorites.map(
                (favorite) => (
                  <FavoriteCard
                    key={favorite.id}
                    favorite={favorite}
                    onRemove={
                      removeFavorite
                    }
                  />
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function VisitsSection() {
  const navigate = useNavigate()

  const {
    user,
    token,
    logout,
    loading: authLoading,
  } = useAuth()

  const [appointments, setAppointments] =
    useState<Appointment[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user || !token) {
      return
    }

    if (user.role !== 'CLIENT') {
      setLoading(false)
      return
    }

    async function fetchAppointments() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://localhost:3000/api/me/appointments',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.status === 401) {
          logout()
          navigate('/login')
          return
        }

        if (!response.ok) {
          throw new Error(
            'Nie udało się pobrać wizyt.',
          )
        }

        const data =
          await response.json()

        setAppointments(
          data.appointments ?? [],
        )
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Wystąpił błąd podczas pobierania wizyt.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [
    authLoading,
    user,
    token,
    logout,
    navigate,
  ])

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="profile-section-page">
        <div className="profile-section-page__container">
          <Link
            to="/profile"
            className="profile-section-page__back"
          >
            ← Profil
          </Link>

          <p className="profile-section-page__eyebrow">
            PROFIL
          </p>

          <h1>Wizyty</h1>

          <p className="profile-section-page__description">
            Ładowanie Twoich wizyt...
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (user.role !== 'CLIENT') {
    return (
      <main className="profile-section-page">
        <div className="profile-section-page__container">
          <Link
            to="/profile"
            className="profile-section-page__back"
          >
            ← Profil
          </Link>

          <p className="profile-section-page__eyebrow">
            PROFIL
          </p>

          <h1>Rezerwacje</h1>

          <p className="profile-section-page__description">
            Sekcja rezerwacji dla trenera będzie dostępna
            w kolejnym kroku.
          </p>
        </div>
      </main>
    )
  }

  const now = new Date()

  const upcomingAppointments =
    appointments
      .filter(
        (appointment) =>
          new Date(
            appointment.startAt,
          ) >= now &&
          appointment.status !==
            'CANCELLED',
      )
      .sort(
        (a, b) =>
          new Date(
            a.startAt,
          ).getTime() -
          new Date(
            b.startAt,
          ).getTime(),
      )

  const historyAppointments =
    appointments
      .filter(
        (appointment) =>
          new Date(
            appointment.startAt,
          ) < now &&
          appointment.status !==
            'CANCELLED',
      )
      .sort(
        (a, b) =>
          new Date(
            b.startAt,
          ).getTime() -
          new Date(
            a.startAt,
          ).getTime(),
      )

  const missedAppointments =
    appointments
      .filter(
        (appointment) =>
          appointment.status ===
          'CANCELLED',
      )
      .sort(
        (a, b) =>
          new Date(
            b.startAt,
          ).getTime() -
          new Date(
            a.startAt,
          ).getTime(),
      )

  return (
    <main className="profile-section-page">
      <div className="profile-section-page__container">
        <Link
          to="/profile"
          className="profile-section-page__back"
        >
          ← Profil
        </Link>

        <header className="profile-section-page__header">
          <p className="profile-section-page__eyebrow">
            PROFIL
          </p>

          <h1>Wizyty</h1>

          <p className="profile-section-page__description">
            Tutaj znajdziesz wszystkie swoje treningi,
            zarówno nadchodzące, jak i zakończone.
          </p>
        </header>

        {error ? (
          <div className="profile-section-page__error">
            {error}
          </div>
        ) : (
          <div className="profile-visits">
            <section className="profile-visits__section">
              <div className="profile-visits__section-header">
                <div>
                  <p className="profile-visits__eyebrow">
                    NAJBLIŻSZE
                  </p>

                  <h2>
                    Nadchodzące wizyty
                  </h2>
                </div>

                <span className="profile-visits__count">
                  {
                    upcomingAppointments.length
                  }
                </span>
              </div>

              {upcomingAppointments.length ===
              0 ? (
                <div className="profile-visits__empty">
                  <h3>
                    Brak nadchodzących wizyt
                  </h3>

                  <p>
                    Nie masz obecnie zaplanowanych
                    nadchodzących treningów.
                  </p>

                  <Link
                    to="/trainers"
                    className="profile-visits__button"
                  >
                    Znajdź trenera
                  </Link>
                </div>
              ) : (
                <div className="profile-visits__list">
                  {upcomingAppointments.map(
                    (appointment) => (
                      <AppointmentCard
                        key={
                          appointment.id
                        }
                        appointment={
                          appointment
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>

            <section className="profile-visits__section">
              <div className="profile-visits__section-header">
                <div>
                  <p className="profile-visits__eyebrow">
                    HISTORIA
                  </p>

                  <h2>
                    Historia wizyt
                  </h2>
                </div>

                <span className="profile-visits__count">
                  {
                    historyAppointments.length
                  }
                </span>
              </div>

              {historyAppointments.length ===
              0 ? (
                <div className="profile-visits__empty">
                  <h3>
                    Brak historii wizyt
                  </h3>

                  <p>
                    Zakończone treningi pojawią się tutaj po
                    odbyciu wizyty.
                  </p>
                </div>
              ) : (
                <div className="profile-visits__list">
                  {historyAppointments.map(
                    (appointment) => (
                      <AppointmentCard
                        key={
                          appointment.id
                        }
                        appointment={
                          appointment
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>

            <section className="profile-visits__section profile-visits__section--missed">
              <div className="profile-visits__section-header">
                <div>
                  <p className="profile-visits__eyebrow">
                    NIEODBYTE
                  </p>

                  <h2>
                    Niedoszłe wizyty
                  </h2>
                </div>

                <span className="profile-visits__count">
                  {
                    missedAppointments.length
                  }
                </span>
              </div>

              {missedAppointments.length ===
              0 ? (
                <div className="profile-visits__empty">
                  <h3>
                    Brak niedoszłych wizyt
                  </h3>

                  <p>
                    Anulowane wizyty, które nie doszły do
                    skutku, pojawią się tutaj.
                  </p>
                </div>
              ) : (
                <div className="profile-visits__list">
                  {missedAppointments.map(
                    (appointment) => (
                      <AppointmentCard
                        key={
                          appointment.id
                        }
                        appointment={
                          appointment
                        }
                        missed
                      />
                    ),
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

function ProfileSectionPage() {
  const { pathname } = useLocation()

  const key =
    pathname.split('/').pop() ?? ''

  if (key === 'visits') {
    return <VisitsSection />
  }

  if (key === 'reviews') {
    return <ReviewsSection />
  }

  if (key === 'favorites') {
    return <FavoritesSection />
  }

  if (key === 'payments') {
    return <PaymentsSection />
  }

  const section =
    sectionMap[key] ?? {
      title: 'Profil',
      description:
        'Ta sekcja jest w przygotowaniu.',
    }

  return (
    <main className="profile-section-page">
      <div className="profile-section-page__container">
        <Link
          to="/profile"
          className="profile-section-page__back"
        >
          ← Profil
        </Link>

        <p className="profile-section-page__eyebrow">
          PROFIL
        </p>

        <h1>{section.title}</h1>

        <p className="profile-section-page__description">
          {section.description}
        </p>
      </div>
    </main>
  )
}

export default ProfileSectionPage