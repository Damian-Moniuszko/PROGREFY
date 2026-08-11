import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './DashboardPage.css'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'CLIENT' | 'TRAINER'
}

interface Appointment {
  id: number
  startAt: string
  endAt: string
  price: string
  status: string
  trainer: {
    id: number
    user: {
      firstName: string
      lastName: string
      avatarUrl: string | null
    }
  }
}

function DashboardPage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDashboard() {
      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const [meResponse, appointmentsResponse] =
          await Promise.all([
            fetch('http://localhost:3000/api/me', {
              headers,
            }),

            fetch(
              'http://localhost:3000/api/me/appointments',
              {
                headers,
              },
            ),
          ])

        if (
          meResponse.status === 401 ||
          appointmentsResponse.status === 401
        ) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }

        if (
          !meResponse.ok ||
          !appointmentsResponse.ok
        ) {
          throw new Error(
            'Nie udało się pobrać danych dashboardu.',
          )
        }

        const meData = await meResponse.json()
        const appointmentsData =
          await appointmentsResponse.json()

        setUser(meData.user)
        setAppointments(
          appointmentsData.appointments,
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

    fetchDashboard()
  }, [navigate])

  function handleLogout() {
    localStorage.removeItem('token')
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

  if (loading) {
    return (
      <main className="dashboard-page">
        <p>Ładowanie dashboardu...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          {error}
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const nextAppointment =
    appointments.find(
      (appointment) =>
        new Date(appointment.startAt) > new Date(),
    )

  return (
    <main className="dashboard-page">
      <div className="dashboard">
        <header className="dashboard__header">
          <div>
            <p className="dashboard__eyebrow">
              FITBOOK DASHBOARD
            </p>

            <h1>
              Cześć, {user.firstName} 👋
            </h1>

            <p>
              Zarządzaj swoimi treningami i
              rezerwacjami.
            </p>
          </div>

          <button
            className="dashboard__logout"
            onClick={handleLogout}
          >
            Wyloguj
          </button>
        </header>

        <section className="dashboard__stats">
          <div className="dashboard-stat">
            <span>REZERWACJE</span>
            <strong>{appointments.length}</strong>
          </div>

          <div className="dashboard-stat">
            <span>ROLA</span>
            <strong>
              {user.role === 'CLIENT'
                ? 'Klient'
                : 'Trener'}
            </strong>
          </div>

          <div className="dashboard-stat">
            <span>EMAIL</span>
            <strong>{user.email}</strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <div>
              <p className="dashboard__eyebrow">
                NAJBLIŻSZY TRENING
              </p>

              <h2>Twój najbliższy trening</h2>
            </div>
          </div>

          {nextAppointment ? (
            <div className="next-appointment">
              <div>
                <p className="next-appointment__date">
                  {formatDate(
                    nextAppointment.startAt,
                  )}
                </p>

                <h3>
                  {nextAppointment.trainer.user.firstName}{' '}
                  {nextAppointment.trainer.user.lastName}
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

              <div className="next-appointment__price">
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
            <div className="dashboard-empty">
              <h3>Brak nadchodzących treningów</h3>

              <p>
                Znajdź trenera i zarezerwuj swój
                pierwszy trening.
              </p>

              <button
                onClick={() =>
                  navigate('/trainers')
                }
              >
                Znajdź trenera
              </button>
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <div>
              <p className="dashboard__eyebrow">
                HISTORIA
              </p>

              <h2>Moje treningi</h2>
            </div>

            <button
              className="dashboard-section__link"
              onClick={() =>
                navigate('/trainers')
              }
            >
              Znajdź trenera
            </button>
          </div>

          {appointments.length > 0 ? (
            <div className="appointments-list">
              {appointments.map(
                (appointment) => (
                  <article
                    className="appointment-card"
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
                          appointment.trainer
                            .user.firstName
                        }{' '}
                        {
                          appointment.trainer
                            .user.lastName
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

                    <div>
                      <span className="appointment-status">
                        {appointment.status}
                      </span>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="dashboard-empty">
              <p>
                Nie masz jeszcze żadnych
                rezerwacji.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default DashboardPage