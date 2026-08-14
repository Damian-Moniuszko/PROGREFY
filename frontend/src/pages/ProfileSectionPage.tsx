import { Link, useLocation } from 'react-router-dom'
import './ProfileSectionPage.css'

const sectionMap: Record<string, { title: string; description: string }> = {
  favorites: {
    title: 'Ulubione',
    description: 'Tutaj znajdziesz zapisanych przez Ciebie trenerów.',
  },
  settings: {
    title: 'Ustawienia konta',
    description: 'Tutaj będziemy zarządzać danymi osobowymi, zdjęciem i ustawieniami konta.',
  },
  reviews: {
    title: 'Opinie',
    description: 'Tutaj znajdziesz opinie i oceny wystawione przez Ciebie.',
  },
  payments: {
    title: 'Płatności',
    description: 'Tutaj znajdziesz historię płatności i szczegóły transakcji.',
  },
  terms: {
    title: 'Regulamin',
    description: 'Treść regulaminu PROGREFY zostanie dodana przed uruchomieniem produkcyjnym.',
  },
  privacy: {
    title: 'Polityka prywatności',
    description: 'Treść polityki prywatności PROGREFY zostanie dodana przed uruchomieniem produkcyjnym.',
  },
}

function ProfileSectionPage() {
  const { pathname } = useLocation()
  const key = pathname.split('/').pop() ?? ''
  const section = sectionMap[key] ?? {
    title: 'Profil',
    description: 'Ta sekcja jest w przygotowaniu.',
  }

  return (
    <main className="profile-section-page">
      <div className="profile-section-page__container">
        <Link to="/profile" className="profile-section-page__back">← Profil</Link>
        <p className="profile-section-page__eyebrow">PROFIL</p>
        <h1>{section.title}</h1>
        <p className="profile-section-page__description">{section.description}</p>
      </div>
    </main>
  )
}

export default ProfileSectionPage
