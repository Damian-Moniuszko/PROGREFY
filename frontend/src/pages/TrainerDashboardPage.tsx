import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAppointmentStatusLabel } from '../utils/appointmentStatus'
import './TrainerDashboardPage.css'

interface Appointment {
  id: number
  startAt: string
  endAt: string
  price: string
  status: string
  client: {
    id: number
    user: {
      firstName: string
      lastName: string
      avatarUrl: string | null
    }
  }
}

interface Availability {
  id: number
  trainerId: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

const dayNames: Record<string, string> = {
  MONDAY: 'Poniedziałek',
  TUESDAY: 'Wtorek',
  WEDNESDAY: 'Środa',
  THURSDAY: 'Czwartek',
  FRIDAY: 'Piątek',
  SATURDAY: 'Sobota',
  SUNDAY: 'Niedziela',
}

function TrainerDashboardPage() {
  const navigate = useNavigate()

  const {
    user,
    token,
    logout,
    loading: authLoading,
  } = useAuth()

  const [appointments, setAppointments] = useState<
    Appointment[]
  >([])

  const [availability, setAvailability] = useState<
    Availability[]
  >([])

  const [showAvailabilityForm, setShowAvailabilityForm] =
    useState(false)

  const [availabilityDay, setAvailabilityDay] =
    useState('MONDAY')

  const [availabilityStart, setAvailabilityStart] =
    useState('16:00')

  const [availabilityEnd, setAvailabilityEnd] =
    useState('20:00')

  const [availabilitySaving, setAvailabilitySaving] =
    useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [updatingAppointmentId, setUpdatingAppointmentId] =
    useState<number | null>(null)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user || !token) {
      navigate('/login')
      return
    }

    if (user.role !== 'TRAINER') {
      navigate('/dashboard')
      return
    }

    async function fetchAppointments() {
      try {
        const [
          appointmentsResponse,
          availabilityResponse,
        ] = await Promise.all([
          fetch(
            'http://localhost:3000/api/me/trainer-appointments',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),

          fetch(
            'http://localhost:3000/api/me/availability',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ])

        if (
          appointmentsResponse.status === 401 ||
          availabilityResponse.status === 401
        ) {
          logout()
          navigate('/login')
          return
        }

        if (
          appointmentsResponse.status === 403 ||
          availabilityResponse.status === 403
        ) {
          navigate('/dashboard')
          return
        }

        if (!appointmentsResponse.ok) {
          throw new Error(
            'Nie udało się pobrać rezerwacji.',
          )
        }

        if (!availabilityResponse.ok) {
          throw new Error(
            'Nie udało się pobrać dostępności.',
          )
        }

        const appointmentsData =
          await appointmentsResponse.json()

        const availabilityData =
          await availabilityResponse.json()

        setAppointments(
          appointmentsData.appointments,
        )

        setAvailability(
          availabilityData.availability,
        )
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Wystąpił błąd.',
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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function formatDate(dateString: string) {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  function formatTime(dateString: string) {
    return new Intl.DateTimeFormat('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  if (authLoading || loading) {
    return (
      <main className="trainer-dashboard-page">
        <p>Ładowanie dashboardu...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="trainer-dashboard-page">
        <div className="trainer-dashboard-error">
          {error}
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const upcomingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status !== 'COMPLETED' &&
        appointment.status !== 'CANCELLED',
    )

  const uniqueClients = new Set(
    appointments.map(
      (appointment) => appointment.client.id,
    ),
  ).size

  const totalRevenue = appointments.reduce(
    (total, appointment) =>
      total + Number(appointment.price),
    0,
  )

  const nextAppointment =
    upcomingAppointments[0]

  async function handleAddAvailability() {
    if (!availabilityStart || !availabilityEnd) {
      return
    }

    if (availabilityStart >= availabilityEnd) {
      alert(
        'Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia.',
      )
      return
    }

    setAvailabilitySaving(true)

    try {
      const response = await fetch(
        'http://localhost:3000/api/me/availability',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dayOfWeek: availabilityDay,
            startTime: availabilityStart,
            endTime: availabilityEnd,
          }),
        },
      )

      const data = await response.json()

      if (response.status === 401) {
        logout()
        navigate('/login')
        return
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Nie udało się dodać dostępności.',
        )
      }

      setAvailability((current) =>
        [...current, data.availability].sort(
          (a, b) =>
            a.dayOfWeek.localeCompare(b.dayOfWeek) ||
            a.startTime.localeCompare(b.startTime),
        ),
      )

      setShowAvailabilityForm(false)
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Nie udało się dodać dostępności.',
      )
    } finally {
      setAvailabilitySaving(false)
    }
  }

  async function updateAppointmentStatus(
    appointmentId: number,
    status:
      | 'CONFIRMED'
      | 'CANCELLED'
      | 'COMPLETED',
  ) {
    setUpdatingAppointmentId(appointmentId)

    try {
      const response = await fetch(
        `http://localhost:3000/api/me/trainer-appointments/${appointmentId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        },
      )

      const data = await response.json()

      if (response.status === 401) {
        logout()
        navigate('/login')
        return
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Nie udało się zmienić statusu rezerwacji.',
        )
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: data.appointment.status,
              }
            : appointment,
        ),
      )
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Nie udało się zmienić statusu rezerwacji.',
      )
    } finally {
      setUpdatingAppointmentId(null)
    }
  }

  return (
    <main className="trainer-dashboard-page">
      <div className="trainer-dashboard">
        <header className="trainer-dashboard__header">
          <div>
            <p className="trainer-dashboard__eyebrow">
              FITBOOK · PANEL TRENERA
            </p>

            <h1>
              Cześć, {user.firstName} 👋
            </h1>

            <p>
              Zarządzaj swoimi klientami i
              treningami.
            </p>
          </div>

          <button
            className="trainer-dashboard__logout"
            onClick={handleLogout}
          >
            Wyloguj
          </button>
        </header>

        <section className="trainer-dashboard__stats">
          <div className="trainer-stat">
            <span>REZERWACJE</span>

            <strong>
              {appointments.length}
            </strong>
          </div>

          <div className="trainer-stat">
            <span>KLIENCI</span>

            <strong>{uniqueClients}</strong>
          </div>

          <div className="trainer-stat">
            <span>PRZYCHÓD</span>

            <strong>
              {totalRevenue.toFixed(2)} zł
            </strong>
          </div>
        </section>

        <section className="trainer-dashboard-section">
          <div className="trainer-dashboard-section__header">
            <div>
              <p className="trainer-dashboard__eyebrow">
                NAJBLIŻSZY TRENING
              </p>

              <h2>
                Twój najbliższy trening
              </h2>
            </div>
          </div>

          {nextAppointment ? (
            <div className="trainer-next-appointment">
              <div>
                <p className="trainer-next-appointment__date">
                  {formatDate(
                    nextAppointment.startAt,
                  )}
                </p>

                <h3>
                  {
                    nextAppointment.client.user
                      .firstName
                  }{' '}
                  {
                    nextAppointment.client.user
                      .lastName
                  }
                </h3>

                <p>
                  {formatTime(
                    nextAppointment.startAt,
                  )}{' '}
                  –{' '}
                  {formatTime(
                    nextAppointment.endAt,
                  )}
                </p>
              </div>

              <div className="trainer-next-appointment__price">
                <span>CENA</span>

                <strong>
                  {nextAppointment.price} zł
                </strong>

                <small>
                  {getAppointmentStatusLabel(
                    nextAppointment.status,
                  )}
                </small>
              </div>
            </div>
          ) : (
            <div className="trainer-dashboard-empty">
              <h3>
                Brak nadchodzących treningów
              </h3>

              <p>
                Kiedy klient zarezerwuje trening,
                pojawi się tutaj.
              </p>
            </div>
          )}
        </section>

        <section className="trainer-dashboard-section">
          <div className="trainer-dashboard-section__header">
            <div>
              <p className="trainer-dashboard__eyebrow">
                REZERWACJE
              </p>

              <h2>
                Rezerwacje i treningi
              </h2>
            </div>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="trainer-appointments-list">
              {upcomingAppointments.map(
                (appointment) => (
                  <article
                    className="trainer-appointment-card"
                    key={appointment.id}
                  >
                    <div>
                      <p>
                        {formatDate(
                          appointment.startAt,
                        )}
                      </p>

                      <h3>
                        {
                          appointment.client.user
                            .firstName
                        }{' '}
                        {
                          appointment.client.user
                            .lastName
                        }
                      </h3>
                    </div>

                    <div>
                      <p>
                        {formatTime(
                          appointment.startAt,
                        )}{' '}
                        –{' '}
                        {formatTime(
                          appointment.endAt,
                        )}
                      </p>

                      <span>
                        {appointment.price} zł
                      </span>
                    </div>

                    <span className="trainer-appointment-status">
                      {getAppointmentStatusLabel(
                        appointment.status,
                      )}
                    </span>

                    {appointment.status ===
                      'PENDING' && (
                      <div className="trainer-appointment-actions">
                        <button
                          className="trainer-appointment-confirm"
                          disabled={
                            updatingAppointmentId ===
                            appointment.id
                          }
                          onClick={() =>
                            updateAppointmentStatus(
                              appointment.id,
                              'CONFIRMED',
                            )
                          }
                        >
                          {updatingAppointmentId ===
                          appointment.id
                            ? '...'
                            : '✓ Akceptuj'}
                        </button>

                        <button
                          className="trainer-appointment-cancel"
                          disabled={
                            updatingAppointmentId ===
                            appointment.id
                          }
                          onClick={() =>
                            updateAppointmentStatus(
                              appointment.id,
                              'CANCELLED',
                            )
                          }
                        >
                          ✕ Odrzuć
                        </button>
                      </div>
                    )}

                    {appointment.status ===
                      'CONFIRMED' &&
                      new Date(
                        appointment.endAt,
                      ) <= new Date() && (
                        <div className="trainer-appointment-actions">
                          <button
                            className="trainer-appointment-complete"
                            disabled={
                              updatingAppointmentId ===
                              appointment.id
                            }
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                'COMPLETED',
                              )
                            }
                          >
                            {updatingAppointmentId ===
                            appointment.id
                              ? 'Zapisywanie...'
                              : '✓ Oznacz jako zakończony'}
                          </button>
                        </div>
                      )}
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="trainer-dashboard-empty">
              <p>
                Nie masz jeszcze żadnych
                rezerwacji.
              </p>
            </div>
          )}
        </section>

        <section className="trainer-dashboard-section">
          <div className="trainer-dashboard-section__header">
            <div>
              <p className="trainer-dashboard__eyebrow">
                DOSTĘPNOŚĆ
              </p>

              <h2>Moja dostępność</h2>

              <button
                className="trainer-availability-add"
                onClick={() =>
                  setShowAvailabilityForm(
                    (current) => !current,
                  )
                }
              >
                {showAvailabilityForm
                  ? 'Anuluj'
                  : '+ Dodaj dostępność'}
              </button>
            </div>
          </div>

          {showAvailabilityForm && (
            <div className="trainer-availability-form">
              <label>
                Dzień tygodnia

                <select
                  value={availabilityDay}
                  onChange={(event) =>
                    setAvailabilityDay(
                      event.target.value,
                    )
                  }
                >
                  <option value="MONDAY">
                    Poniedziałek
                  </option>

                  <option value="TUESDAY">
                    Wtorek
                  </option>

                  <option value="WEDNESDAY">
                    Środa
                  </option>

                  <option value="THURSDAY">
                    Czwartek
                  </option>

                  <option value="FRIDAY">
                    Piątek
                  </option>

                  <option value="SATURDAY">
                    Sobota
                  </option>

                  <option value="SUNDAY">
                    Niedziela
                  </option>
                </select>
              </label>

              <label>
                Od

                <input
                  type="time"
                  value={availabilityStart}
                  onChange={(event) =>
                    setAvailabilityStart(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Do

                <input
                  type="time"
                  value={availabilityEnd}
                  onChange={(event) =>
                    setAvailabilityEnd(
                      event.target.value,
                    )
                  }
                />
              </label>

              <button
                className="trainer-availability-submit"
                onClick={handleAddAvailability}
                disabled={availabilitySaving}
              >
                {availabilitySaving
                  ? 'Zapisywanie...'
                  : 'Dodaj'}
              </button>
            </div>
          )}

          {availability.length > 0 ? (
            <div className="trainer-availability-list">
              {availability.map((item) => (
                <article
                  className="trainer-availability-card"
                  key={item.id}
                >
                  <div>
                    <p className="trainer-availability-card__day">
                      {dayNames[item.dayOfWeek] ??
                        item.dayOfWeek}
                    </p>

                    <p className="trainer-availability-card__time">
                      {item.startTime} –{' '}
                      {item.endTime}
                    </p>
                  </div>

                  <button
                    className="trainer-availability-card__delete"
                    onClick={async () => {
                      try {
                        const response =
                          await fetch(
                            `http://localhost:3000/api/me/availability/${item.id}`,
                            {
                              method: 'DELETE',
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            },
                          )

                        const data =
                          await response.json()

                        if (
                          response.status === 401
                        ) {
                          logout()
                          navigate('/login')
                          return
                        }

                        if (!response.ok) {
                          throw new Error(
                            data.message ||
                              'Nie udało się usunąć dostępności.',
                          )
                        }

                        setAvailability(
                          (current) =>
                            current.filter(
                              (
                                availabilityItem,
                              ) =>
                                availabilityItem.id !==
                                item.id,
                            ),
                        )
                      } catch (error) {
                        alert(
                          error instanceof Error
                            ? error.message
                            : 'Nie udało się usunąć dostępności.',
                        )
                      }
                    }}
                  >
                    Usuń
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="trainer-dashboard-empty">
              <h3>
                Brak ustawionej dostępności
              </h3>

              <p>
                Dodaj godziny, w których klienci
                mogą rezerwować treningi.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default TrainerDashboardPage