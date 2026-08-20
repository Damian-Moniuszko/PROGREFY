import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
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
    <svg viewBox="0px 0px 24px 24px" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, loading } = useAuth()

  if (loading) {
    return <main className="profile-page"><p>Ładowanie profilu...</p></main>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const visitLabel = user.role === 'TRAINER' ? 'Rezerwacje' : 'Wizyty'

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

        <section className="profile-menu">
          <Link className="profile-row" to="/profile/visits">
            <span><strong>{visitLabel}</strong><small>Historia i nadchodzące treningi</small></span>
            <ArrowIcon />
          </Link>

          <Link className="profile-row" to="/profile/favorites">
            <span><strong>Ulubione</strong><small>Zapisani trenerzy</small></span>
            <ArrowIcon />
          </Link>

          <Link className="profile-row" to="/settings">
            <span><strong>Ustawienia konta</strong><small>Dane osobowe i konto</small></span>
            <ArrowIcon />
          </Link>

          <button className="profile-row profile-row--logout" onClick={handleLogout}>
            <span><strong>Wyloguj</strong></span>
          </button>
        </section>
      </div>
    </main>
  )
}
