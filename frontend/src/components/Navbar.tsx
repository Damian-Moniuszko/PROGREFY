import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__inner">
        <a href="/" className="navbar__logo">
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
      </nav>
    </header>
  )
}

export default Navbar