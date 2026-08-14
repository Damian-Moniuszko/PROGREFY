import { Link } from 'react-router-dom'
import './TermsPage.css'

function TermsPage() {
  return (
    <main className="terms-page">
      <div className="terms-page__container">
        <Link className="terms-page__back" to="/">
          ← Wróć do strony głównej
        </Link>

        <header className="terms-page__header">
          <p className="terms-page__eyebrow">PROGREFY</p>
          <h1>Regulamin platformy</h1>
          <p className="terms-page__lead">
            Zasady korzystania z platformy PROGREFY oraz rezerwacji usług treningowych.
          </p>
          <p className="terms-page__updated">Ostatnia aktualizacja: 14 sierpnia 2026 r.</p>
        </header>

        <aside className="terms-page__notice">
          <strong>Przed publikacją uzupełnij dane operatora.</strong> W szczególności nazwę firmy,
          adres, NIP, e-mail i numer telefonu oraz przekaż dokument do weryfikacji prawnej.
        </aside>

        <nav className="terms-page__contents" aria-label="Spis treści">
          <h2>Spis treści</h2>
          <ol>
            <li><a href="#postanowienia">Postanowienia ogólne</a></li>
            <li><a href="#uslugi">Usługi platformy</a></li>
            <li><a href="#konto">Konto i rezerwacje</a></li>
            <li><a href="#platnosci">Płatności i anulowanie wizyt</a></li>
            <li><a href="#konsumenci">Prawa konsumentów</a></li>
            <li><a href="#odpowiedzialnosc">Odpowiedzialność</a></li>
            <li><a href="#reklamacje">Reklamacje</a></li>
            <li><a href="#dane">Dane osobowe</a></li>
            <li><a href="#koncowe">Postanowienia końcowe</a></li>
          </ol>
        </nav>

        <article className="terms-page__content">
          <section id="postanowienia">
            <h2>1. Postanowienia ogólne</h2>
            <p>
              Niniejszy regulamin określa zasady korzystania z internetowej platformy PROGREFY,
              dostępnej w domenie wskazanej przez operatora platformy („Platforma”).
            </p>
            <p>
              Operatorem Platformy jest <strong>[pełna nazwa przedsiębiorcy]</strong>, z siedzibą
              pod adresem <strong>[adres]</strong>, NIP: <strong>[NIP]</strong>, e-mail:{' '}
              <strong>[adres e-mail]</strong>, telefon: <strong>[numer telefonu]</strong>
              („Operator”).
            </p>
            <p>
              Użytkownikiem jest osoba korzystająca z Platformy. Konsumentem jest użytkownik
              będący osobą fizyczną, która korzysta z Platformy w celu niezwiązanym bezpośrednio
              z jej działalnością gospodarczą lub zawodową.
            </p>
          </section>

          <section id="uslugi">
            <h2>2. Usługi platformy</h2>
            <p>
              PROGREFY umożliwia trenerom prezentowanie ofert usług treningowych, a klientom
              wyszukiwanie trenerów, sprawdzanie dostępności, rezerwowanie terminów i — jeśli
              dana oferta to przewiduje — dokonywanie płatności.
            </p>
            <p>
              Operator zapewnia narzędzie techniczne do zawarcia kontaktu i obsługi rezerwacji.
              O ile na stronie oferty nie wskazano inaczej, stronami umowy o wykonanie usługi
              treningowej są klient i wybrany trener. Trener odpowiada za opis, cenę, wykonanie
              oraz zgodność swojej usługi z przepisami prawa.
            </p>
          </section>

          <section id="konto">
            <h2>3. Konto, rezerwacje i obowiązki użytkownika</h2>
            <p>
              Utworzenie konta wymaga podania prawdziwych i aktualnych danych. Użytkownik
              odpowiada za ochronę danych dostępowych i za działania wykonane z użyciem jego konta.
            </p>
            <p>
              Rezerwacja jest składana po wyborze trenera, terminu oraz zapoznaniu się z ceną,
              czasem trwania usługi i zasadami danego trenera. Przed potwierdzeniem rezerwacji
              klient powinien mieć możliwość poprawienia danych.
            </p>
            <p>
              Zabronione jest korzystanie z Platformy niezgodnie z prawem, naruszanie praw osób
              trzecich, publikowanie treści bezprawnych oraz podejmowanie działań zakłócających
              jej działanie.
            </p>
          </section>

          <section id="platnosci">
            <h2>4. Płatności i anulowanie wizyt</h2>
            <p>
              Cena, sposób płatności, zasady anulowania i ewentualnego zwrotu za usługę są
              prezentowane przy ofercie trenera i przed złożeniem rezerwacji. Klient powinien
              zapoznać się z tymi informacjami przed dokonaniem płatności.
            </p>
            <p>
              Operator nie jest stroną umowy o usługę treningową, chyba że wyraźnie wskaże inaczej.
              W sprawach dotyczących wykonania usługi, w tym zmiany terminu lub rozliczenia,
              klient powinien w pierwszej kolejności skontaktować się z trenerem.
            </p>
            <p>
              Potwierdzenie rezerwacji i informacje o płatności są udostępniane w koncie użytkownika
              lub przesyłane na adres e-mail podany podczas rejestracji.
            </p>
          </section>

          <section id="konsumenci">
            <h2>5. Prawa konsumentów</h2>
            <p>
              Przed zawarciem odpłatnej umowy konsument otrzymuje jasne informacje o usłudze,
              cenie, danych przedsiębiorcy świadczącego usługę, sposobie kontaktu oraz zasadach
              płatności i anulowania.
            </p>
            <p>
              Jeżeli umowa jest zawierana na odległość, konsumentowi co do zasady przysługuje
              prawo odstąpienia od umowy w terminie 14 dni od jej zawarcia, z wyjątkami
              przewidzianymi przez obowiązujące przepisy.
            </p>
            <p>
              Jeżeli konsument wyraźnie zażąda rozpoczęcia wykonania usługi przed upływem terminu
              do odstąpienia, zostanie poinformowany o konsekwencjach takiego żądania. Po pełnym
              wykonaniu usługi prawo odstąpienia może nie przysługiwać, jeśli wymogi ustawowe
              zostały spełnione.
            </p>
            <p>
              Niniejszy regulamin nie ogranicza praw konsumenta wynikających z bezwzględnie
              obowiązujących przepisów prawa.
            </p>
          </section>

          <section id="odpowiedzialnosc">
            <h2>6. Odpowiedzialność</h2>
            <p>
              Operator dokłada rozsądnych starań, aby Platforma działała prawidłowo i bezpiecznie,
              jednak nie gwarantuje jej nieprzerwanej dostępności w przypadku prac technicznych,
              awarii lub zdarzeń niezależnych od Operatora.
            </p>
            <p>
              Operator nie odpowiada za jakość, bezpieczeństwo, rezultat ani zgodność z opisem
              usługi treningowej świadczonej przez trenera, z zastrzeżeniem obowiązujących
              przepisów prawa oraz sytuacji, w których odpowiedzialność Operatora wynika wprost
              z jego własnego działania lub zaniechania.
            </p>
          </section>

          <section id="reklamacje">
            <h2>7. Reklamacje i kontakt</h2>
            <p>
              Reklamacje dotyczące działania Platformy można przesłać na adres e-mail
              <strong> [adres e-mail Operatora]</strong>. Zgłoszenie powinno zawierać dane
              umożliwiające identyfikację użytkownika, opis problemu i oczekiwany sposób rozwiązania.
            </p>
            <p>
              Operator udzieli odpowiedzi na reklamację w terminie 14 dni od jej otrzymania,
              chyba że bezwzględnie obowiązujące przepisy przewidują inny termin. Reklamacje
              dotyczące realizacji usługi przez trenera należy kierować do tego trenera.
            </p>
          </section>

          <section id="dane">
            <h2>8. Dane osobowe</h2>
            <p>
              Zasady przetwarzania danych osobowych oraz informacje o prawach osób, których dane
              dotyczą, są opisane w Polityce prywatności. Operator powinien udostępnić ją przed
              rozpoczęciem przetwarzania danych osobowych użytkownika.
            </p>
          </section>

          <section id="koncowe">
            <h2>9. Postanowienia końcowe</h2>
            <p>
              Regulamin jest udostępniany nieodpłatnie w sposób umożliwiający jego pozyskanie,
              odtwarzanie i utrwalanie. Umowy zawierane za pośrednictwem Platformy są zawierane
              w języku polskim.
            </p>
            <p>
              O zmianie regulaminu użytkownicy zostaną poinformowani z odpowiednim wyprzedzeniem,
              w sposób właściwy dla charakteru zmiany. Do umów zawartych przed wejściem w życie
              zmian stosuje się wersję regulaminu obowiązującą w chwili ich zawarcia.
            </p>
          </section>
        </article>
      </div>
    </main>
  )
}

export default TermsPage
