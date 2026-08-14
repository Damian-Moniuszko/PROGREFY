import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.8-3.3 3.1-5 6.5-5s5.7 1.7 6.5 5" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  const searchRef = useRef<HTMLDivElement>(null)

  const closeMenu = () => setIsMenuOpen(false)

  const dashboardPath =
    user?.role === 'TRAINER'
      ? '/trainer/dashboard'
      : '/dashboard'

  useEffect(() => {
    async function fetchTrainers() {
      try {
        const response = await fetch(
          'http://localhost:3000/api/trainers',
        )

        if (!response.ok) {
          return
        }

        const data = await response.json()
        setTrainers(data.trainers ?? [])
      } catch {
        // Search remains available even if trainers cannot be loaded.
      }
    }

    fetchTrainers()
  }, [])

  useEffect(() => {
    setSearchQuery('')
    setIsSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )
    }
  }, [])

  const normalizedQuery =
    searchQuery.trim().toLowerCase()

  const filteredTrainers = normalizedQuery
    ? trainers
        .filter((trainer) => {
          const searchableText = [
            trainer.user.firstName,
            trainer.user.lastName,
            trainer.specialization,
            trainer.location,
            trainer.bio,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return searchableText.includes(
            normalizedQuery,
          )
        })
        .slice(0, 5)
    : []

  const showSearchResults =
    isSearchOpen && normalizedQuery.length > 0

  return (
    <header className="navbar">
      <nav className="navbar__container">
        <Link
          to="/"
          className="navbar__logo"
          onClick={closeMenu}
        >
          <span
            className="navbar__brand-mark"
            aria-hidden="true"
          >
            P
          </span>

          <span>PROGREFY</span>
        </Link>

        <div
          className="navbar__search"
          ref={searchRef}
        >
          <div className="navbar__search-input">
            <SearchIcon />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setIsSearchOpen(true)
                }
              }}
              placeholder="Szukaj trenera, miasta lub specjalizacji"
              aria-label="Szukaj trenera, miasta lub specjalizacji"
            />

            {searchQuery && (
              <button
                type="button"
                className="navbar__search-clear"
                onClick={() => {
                  setSearchQuery('')
                  setIsSearchOpen(false)
                }}
                aria-label="Wyczyść wyszukiwanie"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {showSearchResults && (
            <div className="navbar__search-results">
              {filteredTrainers.length > 0 ? (
                <>
                  <p className="navbar__search-label">
                    TRENERZY
                  </p>

                  {filteredTrainers.map((trainer) => (
                    <Link
                      key={trainer.id}
                      to={`/trainers/${trainer.id}`}
                      className="navbar__search-result"
                      onClick={() => {
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      }}
                    >
                      <span className="navbar__search-avatar">
                        {trainer.user.avatarUrl ? (
                          <img
                            src={trainer.user.avatarUrl}
                            alt=""
                          />
                        ) : (
                          <span>
                            {trainer.user.firstName.charAt(
                              0,
                            )}
                            {trainer.user.lastName.charAt(
                              0,
                            )}
                          </span>
                        )}
                      </span>

                      <span className="navbar__search-result-info">
                        <strong>
                          {trainer.user.firstName}{' '}
                          {trainer.user.lastName}
                        </strong>

                        <small>
                          {[
                            trainer.specialization,
                            trainer.location,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </small>
                      </span>
                    </Link>
                  ))}

                  <Link
                    to="/trainers"
                    className="navbar__search-all"
                    onClick={() => {
                      setSearchQuery('')
                      setIsSearchOpen(false)
                    }}
                  >
                    Zobacz wszystkich trenerów →
                  </Link>
                </>
              ) : (
                <div className="navbar__search-empty">
                  <strong>
                    Nie znaleziono trenera
                  </strong>

                  <span>
                    Spróbuj innego miasta,
                    specjalizacji lub nazwiska.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar__links">
          <Link
            to="/trainers"
            className="navbar__link"
          >
            Trenerzy
          </Link>

          <a
            href="/#how-it-works"
            className="navbar__link"
          >
            Jak to działa
          </a>

          {!loading &&
            (isAuthenticated ? (
              <Link
                to="/profile"
                className="navbar__profile-link"
              >
                <span
                  className="navbar__avatar"
                  aria-hidden="true"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                    />
                  ) : (
                    <UserIcon />
                  )}
                </span>

                <span>Profil</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="navbar__auth-link"
              >
                <span
                  className="navbar__avatar"
                  aria-hidden="true"
                >
                  <UserIcon />
                </span>

                <span>
                  Zaloguj się / Załóż konto
                </span>
              </Link>
            ))}
        </div>

        <button
          className={`navbar__menu-button ${
            isMenuOpen ? 'is-open' : ''
          }`}
          onClick={() =>
            setIsMenuOpen((open) => !open)
          }
          aria-label={
            isMenuOpen
              ? 'Zamknij menu'
              : 'Otwórz menu'
          }
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
        </button>
      </nav>

      <div
        className={`navbar__mobile-menu ${
          isMenuOpen ? 'is-open' : ''
        }`}
      >
        <div className="navbar__mobile-links">
          <div className="navbar__mobile-search">
            <div className="navbar__search-input">
              <SearchIcon />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setIsSearchOpen(true)
                }}
                placeholder="Szukaj trenera, miasta lub specjalizacji"
                aria-label="Szukaj trenera, miasta lub specjalizacji"
              />
            </div>

            {isSearchOpen &&
              normalizedQuery &&
              filteredTrainers.length > 0 && (
                <div className="navbar__mobile-search-results">
                  {filteredTrainers.map((trainer) => (
                    <Link
                      key={trainer.id}
                      to={`/trainers/${trainer.id}`}
                      onClick={closeMenu}
                    >
                      <span>
                        {trainer.user.firstName}{' '}
                        {trainer.user.lastName}
                      </span>

                      <small>
                        {[
                          trainer.specialization,
                          trainer.location,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </small>
                    </Link>
                  ))}
                </div>
              )}
          </div>

          <Link
            to="/trainers"
            onClick={closeMenu}
          >
            Trenerzy
          </Link>

          <a
            href="/#how-it-works"
            onClick={closeMenu}
          >
            Jak to działa
          </a>

          {!loading &&
            (isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                >
                  <span className="navbar__mobile-user">
                    <span
                      className="navbar__avatar"
                      aria-hidden="true"
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt=""
                        />
                      ) : (
                        <UserIcon />
                      )}
                    </span>

                    <span>Profil</span>
                  </span>
                </Link>

                <Link
                  to={dashboardPath}
                  onClick={closeMenu}
                >
                  Moje treningi
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
              >
                <span className="navbar__mobile-user">
                  <span
                    className="navbar__avatar"
                    aria-hidden="true"
                  >
                    <UserIcon />
                  </span>

                  <span>
                    Zaloguj się / Załóż konto
                  </span>
                </span>
              </Link>
            ))}
        </div>
      </div>
    </header>
  )
}

export default Navbar