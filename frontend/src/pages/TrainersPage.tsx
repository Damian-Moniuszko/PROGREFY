import { useEffect, useMemo, useState } from 'react'
import './TrainersPage.css'
import {
  notifyFavoritesChanged,
  subscribeToFavoritesChanged,
} from '../utils/favoriteSync'

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

interface FavoriteResponse {
  favorites?: Array<{
    trainer: {
      id: number
    }
  }>
}

function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [favoriteTrainerIds, setFavoriteTrainerIds] =
    useState<number[]>([])

  const [favoriteLoadingId, setFavoriteLoadingId] =
    useState<number | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const [selectedLocation, setSelectedLocation] =
    useState('')

  const [selectedSpecialization, setSelectedSpecialization] =
    useState('')

  const [selectedDuration, setSelectedDuration] =
    useState('')

  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')


  useEffect(() => {
    async function fetchTrainers() {
      try {
        const response = await fetch(
          'http://localhost:3000/api/trainers',
        )

        if (!response.ok) {
          throw new Error()
        }

        const data = await response.json()

        setTrainers(data.trainers ?? [])
      } catch {
        setError(
          'Nie udało się pobrać trenerów.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTrainers()
  }, [])


  async function loadFavorites() {
    const token =
      localStorage.getItem('token')

    if (!token) {
      setFavoriteTrainerIds([])
      return
    }

    try {
      const response = await fetch(
        'http://localhost:3000/api/me/favorites',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        return
      }

      const data: FavoriteResponse =
        await response.json()

      setFavoriteTrainerIds(
        (data.favorites ?? []).map(
          (item) =>
            item.trainer.id,
        ),
      )
    } catch {
      setFavoriteTrainerIds([])
    }
  }


  useEffect(() => {
    loadFavorites()
  }, [])


  useEffect(() => {
    return subscribeToFavoritesChanged(
      (
        trainerId,
        isFavorite,
      ) => {
        setFavoriteTrainerIds(
          (current) => {
            if (isFavorite) {
              if (
                current.includes(
                  trainerId,
                )
              ) {
                return current
              }

              return [
                ...current,
                trainerId,
              ]
            }

            return current.filter(
              (id) =>
                id !== trainerId,
            )
          },
        )
      },
    )
  }, [])


  const locations = useMemo(() => {
    return Array.from(
      new Set(
        trainers
          .map(
            (trainer) =>
              trainer.location?.trim(),
          )
          .filter(Boolean),
      ),
    ).sort() as string[]
  }, [trainers])


  const specializations =
    useMemo(() => {
      return Array.from(
        new Set(
          trainers
            .map(
              (trainer) =>
                trainer.specialization?.trim(),
            )
            .filter(Boolean),
        ),
      ).sort() as string[]
    }, [trainers])


  const durations = useMemo(() => {
    return Array.from(
      new Set(
        trainers
          .map(
            (trainer) =>
              trainer.durationMinutes,
          )
          .filter(
            (
              duration,
            ): duration is number =>
              duration !== null,
          ),
      ),
    ).sort(
      (a, b) =>
        a - b,
    )
  }, [trainers])
  const filteredTrainers = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLocaleLowerCase('pl-PL')

    return trainers.filter(
      (trainer) => {
        const text = [
          trainer.user.firstName,
          trainer.user.lastName,
          trainer.specialization,
          trainer.location,
          trainer.bio,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('pl-PL')


        const matchesSearch =
          !query ||
          text.includes(query)


        const matchesLocation =
          !selectedLocation ||
          trainer.location ===
            selectedLocation


        const matchesSpecialization =
          !selectedSpecialization ||
          trainer.specialization ===
            selectedSpecialization


        const matchesDuration =
          !selectedDuration ||
          trainer.durationMinutes ===
            Number(selectedDuration)


        const price =
          trainer.price
            ? Number(trainer.price)
            : null


        const min =
          minPrice
            ? Number(minPrice)
            : null


        const max =
          maxPrice
            ? Number(maxPrice)
            : null


        const matchesMin =
          min === null ||
          (price !== null &&
            price >= min)


        const matchesMax =
          max === null ||
          (price !== null &&
            price <= max)


        return (
          matchesSearch &&
          matchesLocation &&
          matchesSpecialization &&
          matchesDuration &&
          matchesMin &&
          matchesMax
        )
      },
    )
  }, [
    trainers,
    searchQuery,
    selectedLocation,
    selectedSpecialization,
    selectedDuration,
    minPrice,
    maxPrice,
  ])


  const hasActiveFilters =
    selectedLocation ||
    selectedSpecialization ||
    selectedDuration ||
    minPrice ||
    maxPrice


  function clearFilters() {
    setSelectedLocation('')
    setSelectedSpecialization('')
    setSelectedDuration('')
    setMinPrice('')
    setMaxPrice('')
  }


  async function toggleFavorite(
    trainerId: number,
  ) {
    const token =
      localStorage.getItem('token')

    if (!token) {
      window.location.href = '/login'
      return
    }

    if (favoriteLoadingId !== null) {
      return
    }

    setFavoriteLoadingId(trainerId)

    try {
      const currentResponse = await fetch(
        'http://localhost:3000/api/me/favorites',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const currentData =
        await currentResponse.json()

      const currentlyFavorite =
        (currentData.favorites ?? []).some(
          (favorite: {
            trainer: { id: number }
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

      setFavoriteTrainerIds((current) =>
        currentlyFavorite
          ? current.filter(
              (id) => id !== trainerId,
            )
          : current.includes(trainerId)
            ? current
            : [...current, trainerId],
      )

      notifyFavoritesChanged(
        trainerId,
        !currentlyFavorite,
      )
    } finally {
      setFavoriteLoadingId(null)
    }
  }


  if (loading) {
    return (
      <main className="trainers-page">
        <p className="trainers-page__status">
          Ładowanie trenerów...
        </p>
      </main>
    )
  }


  if (error) {
    return (
      <main className="trainers-page">
        <p className="trainers-page__status">
          {error}
        </p>
      </main>
    )
  }


  return (
    <main className="trainers-page">
      <header className="trainers-page__header">
        <p className="trainers-page__eyebrow">
          PROGREFY TRAINERS
        </p>

        <h1>
          Znajdź swojego trenera
        </h1>

        <p className="trainers-page__description">
          Wybierz trenera dopasowanego
          do swoich celów.
        </p>
      </header>


      <section className="trainers-page__controls">

        <div className="trainers-page__search">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="6.5"
            />

            <path d="M16 16l5 5" />
          </svg>


          <input
            type="search"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value,
              )
            }
            placeholder="Szukaj trenera..."
          />
        </div>


        <button
          type="button"
          className="trainers-page__filter-button"
          onClick={() =>
            setIsFiltersOpen(
              !isFiltersOpen,
            )
          }
        >
          ⚙ Filtry
        </button>


        <span>
          {filteredTrainers.length}
          {' '}
          trenerów
        </span>

      </section>
      {filteredTrainers.length > 0 ? (
        <div className="trainers-page__grid">
          {filteredTrainers.map((trainer) => {
            const isFavorite =
              favoriteTrainerIds.includes(
                trainer.id,
              )

            const isLoading =
              favoriteLoadingId === trainer.id


            return (
              <article
                className="trainer-card"
                key={trainer.id}
              >

                <div className="trainer-card__avatar">

                  {trainer.user.avatarUrl ? (
                    <img
                      src={
                        trainer.user.avatarUrl
                      }
                      alt={`${trainer.user.firstName} ${trainer.user.lastName}`}
                    />
                  ) : (
                    <span>
                      {
                        trainer.user.firstName.charAt(
                          0,
                        )
                      }

                      {
                        trainer.user.lastName.charAt(
                          0,
                        )
                      }
                    </span>
                  )}


                  <button
                    type="button"
                    className={`trainer-card__favorite ${
                      isFavorite
                        ? 'trainer-card__favorite--active'
                        : ''
                    }`}
                    onClick={() =>
                      toggleFavorite(
                        trainer.id,
                      )
                    }
                    disabled={isLoading}
                    aria-label={
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
                            ? 'white'
                            : 'none'
                        }
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                  </button>

                </div>


                <div className="trainer-card__content">

                  <h2>
                    {trainer.user.firstName}{' '}
                    {trainer.user.lastName}
                  </h2>


                  {trainer.specialization && (
                    <p className="trainer-card__specialization">
                      {
                        trainer.specialization
                      }
                    </p>
                  )}


                  {trainer.bio && (
                    <p className="trainer-card__bio">
                      {trainer.bio}
                    </p>
                  )}


                  <div className="trainer-card__details">

                    {trainer.location && (
                      <span>
                        📍 {trainer.location}
                      </span>
                    )}


                    {trainer.price && (
                      <span>
                        💰 {trainer.price} zł
                      </span>
                    )}


                    {trainer.durationMinutes && (
                      <span>
                        ⏱{' '}
                        {
                          trainer.durationMinutes
                        }
                        min
                      </span>
                    )}

                  </div>


                  <button
                    type="button"
                    className="trainer-card__button"
                    onClick={() =>
                      window.location.href =
                        `/trainers/${trainer.id}`
                    }
                  >
                    Zobacz profil
                  </button>

                </div>

              </article>
            )
          })}
        </div>
      ) : (

        <div className="trainers-page__empty">

          <h2>
            Nie znaleziono trenerów
          </h2>

          <p>
            Spróbuj zmienić filtry lub
            wyszukiwanie.
          </p>


          {(searchQuery ||
            hasActiveFilters) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                clearFilters()
              }}
            >
              Wyczyść
            </button>
          )}

        </div>

      )}

    </main>
  )
}

export default TrainersPage