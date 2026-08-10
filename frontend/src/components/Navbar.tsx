import { useState } from 'react'
import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="navbar">
      <nav className="navbar__container">

        <a
          href="#top"
          className="navbar__logo"
          onClick={closeMenu}
        >
          FITBOOK
        </a>

        <div className="navbar__links">
          <a href="#clients" className="navbar__link">
            Dla klientów
          </a>

          <a href="#trainers" className="navbar__link">
            Dla trenerów
          </a>

          <a href="#login" className="navbar__link">
            Zaloguj
          </a>

          <button className="navbar__button">
            Dołącz
          </button>
        </div>

        <button
          className={`navbar__menu-button ${
            isMenuOpen ? 'is-open' : ''
          }`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={
            isMenuOpen
              ? 'Zamknij menu'
              : 'Otwórz menu'
          }
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
        </button>

      </nav>

      <div
        className={`navbar__mobile-menu ${
          isMenuOpen ? 'is-open' : ''
        }`}
      >
        <div className="navbar__mobile-links">

          <a
            href="#clients"
            onClick={closeMenu}
          >
            Dla klientów
          </a>

          <a
            href="#trainers"
            onClick={closeMenu}
          >
            Dla trenerów
          </a>

          <a
            href="#login"
            onClick={closeMenu}
          >
            Zaloguj
          </a>

          <button onClick={closeMenu}>
            Dołącz do FITBOOK
            <span>→</span>
          </button>

        </div>
      </div>

    </header>
  )
}

export default Navbar