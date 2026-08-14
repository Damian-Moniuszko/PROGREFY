import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">

        <div className="footer__main">
          <div className="footer__brand">
            <h2>PROGREFY</h2>

            <p>
              Wszystko, czego potrzebujesz
              <br />
              do treningu.
            </p>
          </div>

          <div className="footer__links">

            <div className="footer__column">
              <span>DLA KLIENTÓW</span>

              <a href="#clients">Znajdź trenera</a>
              <a href="#how-it-works">Jak to działa</a>
              <a href="#progress">Śledź progres</a>
            </div>

            <div className="footer__column">
              <span>DLA TRENERÓW</span>

              <a href="#trainers">Zostań trenerem</a>
              <a href="#clients">Zarządzaj klientami</a>
              <a href="#app">PROGREFY App</a>
            </div>

            <div className="footer__column">
              <span>PROGREFY</span>

              <a href="#top">Strona główna</a>
              <a href="#">Kontakt</a>
              <a href="#">Regulamin</a>
            </div>

          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 PROGREFY. Wszystkie prawa zastrzeżone.</span>

          <span>Polska</span>
        </div>

      </div>
    </footer>
  )
}

export default Footer