import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.8-3.3 3.1-5 6.5-5s5.7 1.7 6.5 5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, loading } = useAuth()

  if (loading) {
    return <main className="profile-page"><p>Ładowanie profilu...</p></main>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const visitLabel = user.role === 'TRAINER' ? 'Rezerwacje' : 'Wizyty'
  const visitDescription = user.role === 'TRAINER'
    ? 'Zarządzaj rezerwacjami treningów'
    : 'Nadchodzące i poprzednie treningi'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <main className="profile-page">
      <div className="profile-page__container">
        <Link to="/" className="profile-page__back">← Wróć</Link>

        <section className="profile-header">
          <div className="profile-header__avatar">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <UserIcon />}
          </div>
          <div>
            <p className="profile-header__eyebrow">PROFIL</p>
            <h1>{user.firstName} {user.lastName}</h1>
            <p>{user.email}</p>
          </div>
        </section>

        <section className="profile-menu" aria-label="Ustawienia profilu">
          <div className="profile-menu__group">
            <p className="profile-menu__label">KONTO</p>

            <Link className="profile-row" to="/profile/visits">
              <span>
                <strong>{visitLabel}</strong>
                <small>{visitDescription}</small>
              </span>
              <ArrowIcon />
            </Link>

            <Link className="profile-row" to="/profile/favorites">
              <span>
                <strong>Ulubione</strong>
                <small>Zapisani trenerzy</small>
              </span>
              <ArrowIcon />
            </Link>

            <Link className="profile-row" to="/settings">
              <span>
                <strong>Ustawienia konta</strong>
                <small>Dane osobowe i ustawienia konta</small>
              </span>
              <ArrowIcon />
            </Link>

            <Link className="profile-row" to="/profile/reviews">
              <span>
                <strong>Opinie</strong>
                <small>Twoje opinie i oceny</small>
              </span>
              <ArrowIcon />
            </Link>

            <Link className="profile-row" to="/profile/payments">
              <span>
                <strong>Płatności</strong>
                <small>Historia płatności</small>
              </span>
              <ArrowIcon />
            </Link>
          </div>

          <div className="profile-menu__group">
            <p className="profile-menu__label">INFORMACJE</p>

            <Link className="profile-row" to="/regulamin">
              <span><strong>Regulamin</strong></span>
              <ArrowIcon />
            </Link>

            <Link className="profile-row" to="/profile/privacy">
              <span><strong>Polityka prywatności</strong></span>
              <ArrowIcon />
            </Link>
          </div>

          <div className="profile-menu__group profile-menu__group--last">
            <button className="profile-row profile-row--logout" onClick={handleLogout}>
              <span><strong>Wyloguj</strong></span>
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProfilePage
