import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAppointmentStatusLabel } from '../utils/appointmentStatus'
import './DashboardPage.css'

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
    provider: string
    providerPaymentId: string | null
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

function DashboardPage() {
  const navigate = useNavigate()

  const {
    user,
    token,
    logout,
    loading: authLoading,
  } = useAuth()

  const [appointments, setAppointments] =
    useState<Appointment[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [
    cancellingAppointmentId,
    setCancellingAppointmentId,
  ] = useState<number | null>(null)

  const [
    payingAppointmentId,
    setPayingAppointmentId,
  ] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user || !token) {
      navigate('/login')
      return
    }

    if (user.role !== 'CLIENT') {
      navigate('/trainer/dashboard')
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

  async function payForAppointment(
    appointmentId: number,
  ) {
    if (!token) {
      navigate('/login')
      return
    }

    setPayingAppointmentId(appointmentId)

    try {
      const response = await fetch(
        `http://localhost:3000/api/me/appointments/${appointmentId}/payment`,
        {
          method: 'POST',
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
            'Nie udało się opłacić treningu.',
        )
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                payment: appointment.payment
                  ? {
                      ...appointment.payment,
                      status:
                        data.payment?.status ??
                        'PAID',
                      providerPaymentId:
                        data.payment
                          ?.providerPaymentId ??
                        appointment.payment
                          .providerPaymentId,
                    }
                  : appointment.payment,
              }
            : appointment,
        ),
      )
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Nie udało się opłacić treningu.',
      )
    } finally {
      setPayingAppointmentId(null)
    }
  }

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
                status:
                  data.appointment.status,
                payment:
                  data.payment &&
                  appointment.payment
                    ? {
                        ...appointment.payment,
                        status:
                          data.payment.status,
                      }
                    : appointment.payment,
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

  function getStatusClass(status: string) {
    switch (status) {
      case 'PENDING':
        return 'appointment-status appointment-status--pending'

      case 'CONFIRMED':
        return 'appointment-status appointment-status--confirmed'

      case 'CANCELLED':
        return 'appointment-status appointment-status--cancelled'

      case 'COMPLETED':
        return 'appointment-status appointment-status--completed'

      default:
        return 'appointment-status'
    }
  }

  function getPaymentStatusLabel(
    status: string,
  ) {
    switch (status) {
      case 'PENDING':
        return 'Oczekuje na płatność'

      case 'PAID':
        return 'Opłacone'

      case 'FAILED':
        return 'Płatność nieudana'

      case 'REFUNDED':
        return 'Płatność zwrócona'

      default:
        return 'Brak informacji o płatności'
    }
  }

  function getPaymentStatusClass(
    status: string,
  ) {
    switch (status) {
      case 'PENDING':
        return 'appointment-payment appointment-payment--pending'

      case 'PAID':
        return 'appointment-payment appointment-payment--paid'

      case 'FAILED':
        return 'appointment-payment appointment-payment--failed'

      case 'REFUNDED':
        return 'appointment-payment appointment-payment--refunded'

      default:
        return 'appointment-payment'
    }
  }

  function isUpcoming(
    appointment: Appointment,
  ) {
    return (
      new Date(appointment.startAt) >
        new Date() &&
      appointment.status !== 'CANCELLED' &&
      appointment.status !== 'COMPLETED'
    )
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
    isUpcoming,
  )

  const pendingCount = appointments.filter(
    (appointment) =>
      appointment.status === 'PENDING',
  ).length

  const confirmedCount = appointments.filter(
    (appointment) =>
      appointment.status === 'CONFIRMED',
  ).length

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

            <strong>
              {appointments.length}
            </strong>
          </div>

          <div className="dashboard-stat">
            <span>OCZEKUJĄCE</span>

            <strong>{pendingCount}</strong>
          </div>

          <div className="dashboard-stat">
            <span>POTWIERDZONE</span>

            <strong>{confirmedCount}</strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <div>
              <p className="dashboard__eyebrow">
                NAJBLIŻSZY TRENING
              </p>

              <h2>
                Twój najbliższy trening
              </h2>
            </div>
          </div>

          {nextAppointment ? (
            <div
              className={`next-appointment next-appointment--${nextAppointment.status.toLowerCase()}`}
            >
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

                <span
                  className={getStatusClass(
                    nextAppointment.status,
                  )}
                >
                  {getAppointmentStatusLabel(
                    nextAppointment.status,
                  )}
                </span>

                {nextAppointment.payment && (
                  <span
                    className={getPaymentStatusClass(
                      nextAppointment.payment
                        .status,
                    )}
                  >
                    💳{' '}
                    {getPaymentStatusLabel(
                      nextAppointment.payment
                        .status,
                    )}
                  </span>
                )}

                {nextAppointment.payment
                  ?.status === 'PENDING' && (
                  <button
                    className="appointment-pay"
                    disabled={
                      payingAppointmentId ===
                      nextAppointment.id
                    }
                    onClick={() =>
                      payForAppointment(
                        nextAppointment.id,
                      )
                    }
                  >
                    {payingAppointmentId ===
                    nextAppointment.id
                      ? 'Płacenie...'
                      : '💳 Zapłać'}
                  </button>
                )}
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
                    className={`appointment-card appointment-card--${appointment.status.toLowerCase()}`}
                    key={appointment.id}
                  >
                    <div className="appointment-card__main">
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

                    <div className="appointment-card__time">
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

                    <div className="appointment-card__status">
                      <span
                        className={getStatusClass(
                          appointment.status,
                        )}
                      >
                        {getAppointmentStatusLabel(
                          appointment.status,
                        )}
                      </span>

                      {appointment.payment && (
                        <span
                          className={getPaymentStatusClass(
                            appointment.payment
                              .status,
                          )}
                        >
                          💳{' '}
                          {getPaymentStatusLabel(
                            appointment.payment
                              .status,
                          )}
                        </span>
                      )}

                      {appointment.payment
                        ?.status === 'PENDING' &&
                        appointment.status !==
                          'CANCELLED' &&
                        appointment.status !==
                          'COMPLETED' && (
                          <button
                            className="appointment-pay"
                            disabled={
                              payingAppointmentId ===
                              appointment.id
                            }
                            onClick={() =>
                              payForAppointment(
                                appointment.id,
                              )
                            }
                          >
                            {payingAppointmentId ===
                            appointment.id
                              ? 'Płacenie...'
                              : '💳 Zapłać'}
                          </button>
                        )}

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