# PROGREFY — kontekst projektu

## Cel aplikacji

PROGREFY to platforma do umawiania konsultacji z trenerami personalnymi.

Aplikacja obsługuje dwie role użytkowników:

- `CLIENT` — przegląda trenerów, sprawdza dostępne terminy, rezerwuje wizyty, realizuje płatności, anuluje wizyty i wystawia opinie.
- `TRAINER` — uzupełnia profil zawodowy, ustala dostępność, zarządza wizytami oraz ich statusami.

## Architektura repozytorium

Repozytorium zawiera dwa niezależne projekty:

- `frontend/` — aplikacja internetowa React.
- `backend/` — REST API Fastify, połączone z bazą PostgreSQL.

W katalogu głównym nie ma wspólnego `package.json`. Polecenia należy uruchamiać osobno w `frontend/` albo `backend/`.

```text
PROGREFY/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
└── backend/
    ├── prisma/
    │   ├── migrations/
    │   └── schema.prisma
    ├── src/
    │   ├── generated/
    │   ├── plugins/
    │   ├── routes/
    │   ├── services/
    │   └── types/
    └── package.json
```

## Frontend

### Stack

- React 19
- TypeScript
- Vite
- React Router
- CSS w plikach przypisanych do stron i komponentów

### Organizacja kodu

- `src/pages/` — widoki oraz główne przepływy użytkownika.
- `src/components/` — komponenty współdzielone i sekcje strony marketingowej.
- `src/context/AuthContext.tsx` — stan zalogowanego użytkownika i token JWT.
- `src/utils/` — funkcje pomocnicze.
- `src/assets/` — zasoby graficzne.
- `public/` — zasoby publiczne.

### Główne ścieżki

- `/` — strona główna.
- `/trainers` — lista trenerów.
- `/trainers/:id` — profil trenera i rezerwacja terminu.
- `/login` — logowanie.
- `/register` — rejestracja.
- `/dashboard` — panel klienta.
- `/trainer/dashboard` — panel trenera.
- `/profile` — profil użytkownika.
- `/profile/:section` — sekcje profilu.

### Integracja z API

Frontend komunikuje się obecnie z API pod adresem:

```text
http://localhost:3000
```

Chronione zapytania muszą przekazywać token:

```http
Authorization: Bearer <token>
```

Token jest przechowywany w `localStorage`, a dane użytkownika są pobierane z `GET /api/me`.

Przy zmianie endpointu, formatu danych lub autoryzacji należy sprawdzić wszystkie użycia API we frontendzie.

### Polecenia frontendowe

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

## Backend

### Stack

- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- `@fastify/jwt`
- Argon2
- `@fastify/cors`

### Organizacja kodu

- `src/server.ts` — tworzy serwer, rejestruje CORS, JWT, Prisma i trasy.
- `src/routes/auth.routes.ts` — rejestracja, logowanie i bieżący użytkownik.
- `src/routes/trainer.routes.ts` — publiczne dane trenerów, dostępność i wolne sloty.
- `src/routes/profile.routes.ts` — profil trenera, media społecznościowe i dostępność.
- `src/routes/appointment.routes.ts` — wizyty, płatności, statusy i opinie.
- `src/services/auth.service.ts` — haszowanie i weryfikacja haseł.
- `src/plugins/prisma.ts` — konfiguracja klienta Prisma.
- `src/types/fastify.d.ts` — rozszerzenia typów Fastify.
- `src/generated/prisma/` — wygenerowany klient Prisma.

### Endpointy

Najważniejsze grupy endpointów:

```text
POST  /api/auth/register
POST  /api/auth/login
GET   /api/me

GET   /api/trainers
GET   /api/trainers/:id
GET   /api/trainers/:id/availability
GET   /api/trainers/:id/slots?date=YYYY-MM-DD

GET   /api/me/trainer-profile
PATCH /api/me/trainer-profile

GET   /api/me/social-links
POST  /api/me/social-links
DELETE /api/me/social-links/:id

GET   /api/me/availability
POST  /api/me/availability
DELETE /api/me/availability/:id

POST  /api/appointments
GET   /api/me/appointments
POST  /api/me/appointments/:id/payment
PATCH /api/me/appointments/:id/cancel

GET   /api/me/trainer-appointments
PATCH /api/me/trainer-appointments/:id/status

GET   /api/me/reviewable-appointments
POST  /api/me/reviews

GET   /api/health
```

### Polecenia backendowe

```bash
cd backend
npm run dev
npm start
```

Backend nasłuchuje domyślnie na porcie `3000`.

## Baza danych

### Technologia

Baza danych to PostgreSQL zarządzany przez Prisma.

Główny schemat znajduje się w:

```text
backend/prisma/schema.prisma
```

Historia zmian bazy znajduje się w:

```text
backend/prisma/migrations/
```

### Najważniejsze modele

- `User` — konto użytkownika, dane podstawowe i rola.
- `ClientProfile` — dane klienta, np. wzrost, waga i cel.
- `TrainerProfile` — oferta trenera, specjalizacja, cena, lokalizacja i zasady.
- `TrainerSocialLink` — linki społecznościowe trenera.
- `Availability` — cykliczna dostępność trenera według dnia tygodnia.
- `Appointment` — umówiona wizyta klienta z trenerem.
- `Payment` — płatność przypisana do wizyty.
- `Review` — opinia klienta po zakończonej wizycie.

### Role i statusy

Role użytkowników:

```text
CLIENT
TRAINER
```

Statusy wizyty:

```text
PENDING
CONFIRMED
CANCELLED
COMPLETED
```

Statusy płatności:

```text
PENDING
PAID
FAILED
REFUNDED
```

### Zasady zmian w bazie

- Zmiany struktury danych wprowadzaj w `prisma/schema.prisma`.
- Po zmianie schematu utwórz nową migrację Prisma.
- Nie zmieniaj ręcznie istniejących plików migracji.
- Nie edytuj ręcznie `backend/src/generated/prisma/`.
- Po zmianie schematu sprawdź wpływ na endpointy i typy używane przez frontend.
- Zachowuj relacje i ograniczenia unikalności, w szczególności dla kont, wizyt, płatności i opinii.

## Autoryzacja i uprawnienia

### JWT

Backend używa JWT. Sekret jest pobierany z:

```text
JWT_SECRET
```

Chronione endpointy powinny wywoływać weryfikację tokenu JWT i korzystać z danych użytkownika wyłącznie po pomyślnej weryfikacji.

### Role

Uprawnienia muszą być sprawdzane po stronie backendu:

- Klient może tworzyć, opłacać i anulować wyłącznie własne wizyty.
- Trener może wyświetlać i aktualizować wyłącznie własny profil, dostępność i wizyty.
- Użytkownik nie może odczytywać ani modyfikować zasobów innego użytkownika przez zmianę identyfikatora w adresie lub body żądania.
- Opinię można dodać wyłącznie dla własnej, zakończonej wizyty.
- Płatność musi dotyczyć wyłącznie wizyty należącej do zalogowanego klienta.

Nie polegaj wyłącznie na ograniczeniach w interfejsie. Każde uprawnienie musi być walidowane w API.

### Hasła

- Hasła są haszowane za pomocą Argon2.
- Nigdy nie zapisuj ani nie loguj haseł w postaci jawnej.
- Nie zwracaj `passwordHash` w odpowiedziach API.
- Nie dodawaj tokenów, haseł ani sekretów do kodu, testów czy komunikatów błędów.

## Zmienne środowiskowe

Backend wymaga co najmniej:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

Zasady:

- Nie commituj plików `.env`.
- Nie umieszczaj prawdziwych danych dostępowych w kodzie.
- Dla dokumentacji stosuj `.env.example` bez wartości sekretów.
- Przy pracy lokalnej upewnij się, że konfiguracja frontendowego adresu API odpowiada portowi backendu.

## Zasady bezpiecznej pracy

- Przed zmianą kodu przeczytaj istniejące implementacje w bezpośrednio powiązanych plikach.
- Nie nadpisuj ani nie usuwaj zmian użytkownika niezwiązanych z aktualnym zadaniem.
- Nie używaj destrukcyjnych poleceń Git, takich jak `git reset --hard`, bez jednoznacznej zgody.
- Nie usuwaj migracji, danych ani katalogów bez wyraźnego polecenia.
- Przed wykonaniem operacji modyfikującej dane w bazie potwierdź jej zakres.
- Nie uruchamiaj migracji ani serwerów, jeśli zadanie dotyczy wyłącznie analizy lub przeglądu.
- Nie ujawniaj sekretów z plików środowiskowych, logów lub konfiguracji.
- Zachowuj zasadę minimalnego zakresu zmian: zmieniaj tylko to, co jest konieczne do realizacji zadania.
- Przy zmianie kontraktu API aktualizuj jednocześnie backend i wszystkie zależne użycia frontendowe.
- Po zakończeniu zmian wykonaj adekwatną walidację, bez ignorowania błędów.

## Weryfikacja zmian

Dla zmian frontendowych:

```bash
cd frontend
npm run lint
npm run build
```

Dla zmian backendowych sprawdź co najmniej:

- zgodność typów TypeScript,
- poprawność tras i autoryzacji,
- wpływ zmian Prisma na schemat i migracje,
- zgodność odpowiedzi API z użyciem we frontendzie.

## Uwagi techniczne

- Endpoint zdrowia w `backend/src/server.ts` zawiera historyczną nazwę `FITBOOK`; przy okazji odpowiedniej zmiany warto ujednolicić ją z nazwą PROGREFY.
- Adres API jest obecnie wpisany bezpośrednio w kilku plikach frontendowych. Przy rozbudowie konfiguracji należy rozważyć użycie zmiennej środowiskowej Vite, np. `VITE_API_URL`.
