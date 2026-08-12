import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

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

  const [cancellingAppointmentId, setCancellingAppointmentId] =
    useState<number | null>(null)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user || !token) {
      navigate('/login')
      return
    }

    async function fetchAppointments() {
      try {
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

  async function cancelAppointment(
    appointmentId: number,
  ) {
    const confirmed = window.confirm(
      'Czy na pewno chcesz anulować tę rezerwację?',
    )

    if (!confirmed) {
      return
    }

    setCancellingAppointmentId(appointmentId)

    try {
      const response = await fetch(
        `http://localhost:3000/api/me/appointments/${appointmentId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
            'Nie udało się anulować rezerwacji.',
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
          : 'Nie udało się anulować rezerwacji.',
      )
    } finally {
      setCancellingAppointmentId(null)
    }
  }

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

  const nextAppointment = appointments.find(
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
                  {
                    nextAppointment.trainer.user
                      .firstName
                  }{' '}
                  {
                    nextAppointment.trainer.user
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
              <h3>
                Brak nadchodzących treningów
              </h3>

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
                          appointment.trainer.user
                            .firstName
                        }{' '}
                        {
                          appointment.trainer.user
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

                    <div>
                      <span className="appointment-status">
                        {appointment.status}
                      </span>

                      {(appointment.status ===
                        'PENDING' ||
                        appointment.status ===
                          'CONFIRMED') && (
                        <button
                          className="appointment-cancel"
                          disabled={
                            cancellingAppointmentId ===
                            appointment.id
                          }
                          onClick={() =>
                            cancelAppointment(
                              appointment.id,
                            )
                          }
                        >
                          {cancellingAppointmentId ===
                          appointment.id
                            ? 'Anulowanie...'
                            : 'Anuluj rezerwację'}
                        </button>
                      )}
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