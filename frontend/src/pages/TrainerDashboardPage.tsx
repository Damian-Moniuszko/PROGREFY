import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        const response = await fetch(
          'http://localhost:3000/api/me/trainer-appointments',
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

        if (response.status === 403) {
          navigate('/dashboard')
          return
        }

        if (!response.ok) {
          throw new Error(
            'Nie udało się pobrać rezerwacji.',
          )
        }

        const data = await response.json()

        setAppointments(data.appointments)
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
        new Date(appointment.startAt) > new Date(),
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
                  {nextAppointment.status}
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
                Nadchodzące treningi
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
                      {appointment.status}
                    </span>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="trainer-dashboard-empty">
              <p>
                Nie masz jeszcze nadchodzących
                rezerwacji.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default TrainerDashboardPage