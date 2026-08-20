import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import './ProfileSectionPage.css'

const sections = {
  favorites: {
    title: 'Ulubione',
    description: 'Tutaj znajdziesz zapisanych trenerów.',
  },
  settings: {
    title: 'Ustawienia konta',
    description: 'Zarządzaj danymi osobowymi i ustawieniami konta.',
  },
  reviews: {
    title: 'Opinie',
    description: 'Twoje opinie i oceny.',
  },
  payments: {
    title: 'Płatności',
    description: 'Historia płatności.',
  },
  privacy: {
    title: 'Polityka prywatności',
    description: 'Informacje dotyczące przetwarzania danych.',
  },
}

export default function ProfileSectionPage() {
  const { user, loading } = useAuth()
  const section = window.location.pathname.split('/').pop() ?? ''
  const current = sections[section as keyof typeof sections]

  if (loading) {
    return <main className="profile-section-page">Ładowanie...</main>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!current) {
    return <Navigate to="/profile" replace />
  }

  return (
    <main className="profile-section-page">
      <div className="profile-section-page__container">
        <Link to="/profile">← Profil</Link>
        <p>PROFIL</p>
        <h1>{current.title}</h1>
        <p>{current.description}</p>
      </div>
    </main>
  )
}
