import { useEffect, useState } from 'react'
import './TrainersPage.css'

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

function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTrainers() {
      try {
        const response = await fetch(
          'http://localhost:3000/api/trainers',
        )

        if (!response.ok) {
          throw new Error('Failed to fetch trainers')
        }

        const data = await response.json()

        setTrainers(data.trainers)
      } catch {
        setError('Nie udało się pobrać trenerów.')
      } finally {
        setLoading(false)
      }
    }

    fetchTrainers()
  }, [])

  if (loading) {
    return (
      <main className="trainers-page">
        <p>Ładowanie trenerów...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="trainers-page">
        <p>{error}</p>
      </main>
    )
  }

  return (
    <main className="trainers-page">
      <div className="trainers-page__header">
        <p className="trainers-page__eyebrow">
          FITBOOK TRAINERS
        </p>

        <h1>Znajdź swojego trenera</h1>

        <p className="trainers-page__description">
          Wybierz trenera dopasowanego do Twoich celów,
          lokalizacji i preferencji treningowych.
        </p>
      </div>

      <div className="trainers-page__grid">
        {trainers.map((trainer) => (
          <article
            className="trainer-card"
            key={trainer.id}
          >
            <div className="trainer-card__avatar">
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

            <div className="trainer-card__content">
              <h2>
                {trainer.user.firstName}{' '}
                {trainer.user.lastName}
              </h2>

              {trainer.specialization && (
                <p className="trainer-card__specialization">
                  {trainer.specialization}
                </p>
              )}

              {trainer.bio && (
                <p className="trainer-card__bio">
                  {trainer.bio}
                </p>
              )}

              <div className="trainer-card__details">
                {trainer.location && (
                  <span>{trainer.location}</span>
                )}

                {trainer.price && (
                  <span>{trainer.price} zł / trening</span>
                )}

                {trainer.durationMinutes && (
                  <span>
                    {trainer.durationMinutes} min
                  </span>
                )}
              </div>

              <button
                className="trainer-card__button"
                onClick={() => {
                  window.location.href =
                    `/trainers/${trainer.id}`
                }}
              >
                Zobacz profil
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

export default TrainersPage