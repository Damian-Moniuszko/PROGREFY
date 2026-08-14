import { useEffect, useMemo, useState } from 'react'
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

  const [searchQuery, setSearchQuery] = useState('')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('')

  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

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

  const locations = useMemo(() => {
    return Array.from(
      new Set(
        trainers
          .map((trainer) => trainer.location?.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a!.localeCompare(b!, 'pl')) as string[]
  }, [trainers])

  const specializations = useMemo(() => {
    return Array.from(
      new Set(
        trainers
          .map((trainer) => trainer.specialization?.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a!.localeCompare(b!, 'pl')) as string[]
  }, [trainers])

  const durations = useMemo(() => {
    return Array.from(
      new Set(
        trainers
          .map((trainer) => trainer.durationMinutes)
          .filter(
            (duration): duration is number =>
              duration !== null,
          ),
      ),
    ).sort((a, b) => a - b)
  }, [trainers])

  const filteredTrainers = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLocaleLowerCase('pl-PL')

    return trainers.filter((trainer) => {
      const searchableText = [
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
        !query || searchableText.includes(query)

      const matchesLocation =
        !selectedLocation ||
        trainer.location === selectedLocation

      const matchesSpecialization =
        !selectedSpecialization ||
        trainer.specialization ===
          selectedSpecialization

      const matchesDuration =
        !selectedDuration ||
        trainer.durationMinutes ===
          Number(selectedDuration)

      const trainerPrice =
        trainer.price !== null
          ? Number(trainer.price)
          : null

      const minimumPrice =
        minPrice !== ''
          ? Number(minPrice)
          : null

      const maximumPrice =
        maxPrice !== ''
          ? Number(maxPrice)
          : null

      const matchesMinPrice =
        minimumPrice === null ||
        (trainerPrice !== null &&
          trainerPrice >= minimumPrice)

      const matchesMaxPrice =
        maximumPrice === null ||
        (trainerPrice !== null &&
          trainerPrice <= maximumPrice)

      return (
        matchesSearch &&
        matchesLocation &&
        matchesSpecialization &&
        matchesDuration &&
        matchesMinPrice &&
        matchesMaxPrice
      )
    })
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
    selectedLocation !== '' ||
    selectedSpecialization !== '' ||
    selectedDuration !== '' ||
    minPrice !== '' ||
    maxPrice !== ''

  function clearFilters() {
    setSelectedLocation('')
    setSelectedSpecialization('')
    setSelectedDuration('')
    setMinPrice('')
    setMaxPrice('')
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
      <div className="trainers-page__header">
        <p className="trainers-page__eyebrow">
          PROGREFY TRAINERS
        </p>

        <h1>Znajdź swojego trenera</h1>

        <p className="trainers-page__description">
          Wybierz trenera dopasowanego do Twoich celów,
          lokalizacji i preferencji treningowych.
        </p>
      </div>

      <section className="trainers-page__controls">
        <div className="trainers-page__search">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l5 5" />
          </svg>

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Szukaj trenera, miasta lub specjalizacji"
            aria-label="Szukaj trenera, miasta lub specjalizacji"
          />
        </div>

        <div className="trainers-page__toolbar">
          <button
            type="button"
            className={`trainers-page__filter-button ${
              isFiltersOpen ? 'is-active' : ''
            }`}
            onClick={() =>
              setIsFiltersOpen((open) => !open)
            }
          >
            <span>⚙</span>
            Filtry

            {hasActiveFilters && (
              <span className="trainers-page__filter-count">
                {
                  [
                    selectedLocation,
                    selectedSpecialization,
                    selectedDuration,
                    minPrice,
                    maxPrice,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>

          <span className="trainers-page__results-count">
            {filteredTrainers.length}{' '}
            {filteredTrainers.length === 1
              ? 'trener'
              : 'trenerów'}
          </span>
        </div>

        {isFiltersOpen && (
          <div className="trainers-page__filters">
            <div className="trainers-page__filters-header">
              <div>
                <p>FILTRY</p>
                <span>
                  Dopasuj wyniki do swoich preferencji.
                </span>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="trainers-page__clear"
                >
                  Wyczyść
                </button>
              )}
            </div>

            <div className="trainers-page__filter-grid">
              <label className="trainers-page__filter">
                <span>Lokalizacja</span>

                <select
                  value={selectedLocation}
                  onChange={(event) =>
                    setSelectedLocation(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Wszystkie lokalizacje
                  </option>

                  {locations.map((location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  ))}
                </select>
              </label>

              <label className="trainers-page__filter">
                <span>Specjalizacja</span>

                <select
                  value={selectedSpecialization}
                  onChange={(event) =>
                    setSelectedSpecialization(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Wszystkie specjalizacje
                  </option>

                  {specializations.map(
                    (specialization) => (
                      <option
                        key={specialization}
                        value={specialization}
                      >
                        {specialization}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="trainers-page__filter">
                <span>Czas treningu</span>

                <select
                  value={selectedDuration}
                  onChange={(event) =>
                    setSelectedDuration(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Wszystkie czasy
                  </option>

                  {durations.map((duration) => (
                    <option
                      key={duration}
                      value={duration}
                    >
                      {duration} min
                    </option>
                  ))}
                </select>
              </label>

              <div className="trainers-page__filter trainers-page__filter--price">
                <span>Cena za trening</span>

                <div className="trainers-page__price-fields">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) =>
                      setMinPrice(event.target.value)
                    }
                    placeholder="Od"
                  />

                  <span>—</span>

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) =>
                      setMaxPrice(event.target.value)
                    }
                    placeholder="Do"
                  />

                  <small>zł</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {hasActiveFilters && (
        <div className="trainers-page__active-filters">
          {selectedLocation && (
            <button
              type="button"
              onClick={() => setSelectedLocation('')}
            >
              {selectedLocation}
              <span>×</span>
            </button>
          )}

          {selectedSpecialization && (
            <button
              type="button"
              onClick={() =>
                setSelectedSpecialization('')
              }
            >
              {selectedSpecialization}
              <span>×</span>
            </button>
          )}

          {selectedDuration && (
            <button
              type="button"
              onClick={() => setSelectedDuration('')}
            >
              {selectedDuration} min
              <span>×</span>
            </button>
          )}

          {minPrice && (
            <button
              type="button"
              onClick={() => setMinPrice('')}
            >
              od {minPrice} zł
              <span>×</span>
            </button>
          )}

          {maxPrice && (
            <button
              type="button"
              onClick={() => setMaxPrice('')}
            >
              do {maxPrice} zł
              <span>×</span>
            </button>
          )}
        </div>
      )}

      {filteredTrainers.length > 0 ? (
        <div className="trainers-page__grid">
          {filteredTrainers.map((trainer) => (
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
                    <span>
                      {trainer.location}
                    </span>
                  )}

                  {trainer.price && (
                    <span>
                      {trainer.price} zł / trening
                    </span>
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
      ) : (
        <div className="trainers-page__empty">
          <div className="trainers-page__empty-icon">
            ×
          </div>

          <h2>Nie znaleziono trenerów</h2>

          <p>
            Spróbuj zmienić wyszukiwanie lub
            wyczyścić wybrane filtry.
          </p>

          {(searchQuery || hasActiveFilters) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                clearFilters()
              }}
            >
              Wyczyść wyszukiwanie
            </button>
          )}
        </div>
      )}
    </main>
  )
}

export default TrainersPage