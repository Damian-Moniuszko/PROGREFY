import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './TrainingCenterPage.css'
import { useNavigate } from 'react-router-dom'

interface DashboardData {
  user: {
    firstName: string
    lastName: string
  }

  nextAppointment: {
    date: string
    trainer: string
  } | null

  currentPlan: {
    id: number
    name: string
    description: string | null
    durationWeeks: number | null

    workouts: {
      id: number
      name: string
      dayOfWeek: string | null

      exercises: {
        id: number
        sets: number
        reps: string

        exercise: {
          name: string
          muscleGroup: string | null
        }
      }[]
    }[]
  } | null

  lastWorkout: {
    date: string
    workout: string
  } | null
}

const TrainingCenterPage = () => {
  const { token } = useAuth()

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) return

      try {
        const response = await fetch(
          'http://localhost:3000/api/training/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            'Nie udało się pobrać dashboardu'
          )
        }

        const data = await response.json()

        setDashboard(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [token])

  if (loading) {
    return (
      <main className="training-center">
        <h2>
          Ładowanie centrum treningowego...
        </h2>
      </main>
    )
  }

  return (
    <main className="training-center">
      <div className="training-center__container">

        {/* HEADER */}
        <header className="training-center__header">
          <p className="training-center__eyebrow">
            CENTRUM TRENINGOWE
          </p>

          <h1>
            Witaj {dashboard?.user.firstName} 👋
          </h1>

          <p>
            Zarządzaj treningami, planami i obserwuj swój progres.
          </p>
        </header>

        {/* NAVIGATION */}
        <nav className="training-center__tabs">

          <button
            className="training-center__tab training-center__tab--active"
            onClick={() => navigate('/training-center')}
          >
            Dashboard
          </button>

          <button
            className="training-center__tab"
            onClick={() =>
              navigate('/training-center/plan')
            }
          >
            Plan treningowy
          </button>

          <button className="training-center__tab">
            Dieta
          </button>

          <button
            className="training-center__tab"
            onClick={() =>
              navigate('/training-center/progress')
            }
          >
            Progres
          </button>

        </nav>

        {/* DASHBOARD */}
        <section className="training-dashboard">

          {/* NEXT WORKOUT */}
          <div className="training-card training-card--main">

            <span>
              NAJBLIŻSZY TRENING
            </span>

            <h2>
              {dashboard?.nextAppointment
                ? new Date(
                    dashboard.nextAppointment.date
                  ).toLocaleString()
                : 'Brak zaplanowanego treningu'
              }
            </h2>

            <p>
              Twój kolejny trening zostanie tutaj wyświetlony.
            </p>

            <button>
              Rozpocznij trening
            </button>

          </div>

          {/* PROGRESS */}
          <div className="training-card">

            <span>
              TWÓJ PROGRES
            </span>

            <h2>
              Brak danych
            </h2>

            <p>
              Dodamy tutaj pomiary i historię treningów.
            </p>

          </div>

          {/* TRAINING PLAN */}
          <div className="training-card">

            <span>
              TWÓJ PLAN TRENINGOWY
            </span>

            {dashboard?.currentPlan ? (
              <>
                <h2>
                  {dashboard.currentPlan.name}
                </h2>

                <p>
                  {dashboard.currentPlan.description}
                </p>

                <div>
                  {dashboard.currentPlan.workouts.map(
                    (workout) => (
                      <div key={workout.id}>

                        <h3>
                          {workout.name}
                        </h3>

                        {workout.exercises.map(
                          (item) => (
                            <p key={item.id}>
                              {item.exercise.name}
                              {' - '}
                              {item.sets} serie
                              {' x '}
                              {item.reps}
                            </p>
                          )
                        )}

                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <p>
                Brak planu
              </p>
            )}

          </div>

        </section>

      </div>
    </main>
  )
}

export default TrainingCenterPage