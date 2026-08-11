import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:3000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            role: 'CLIENT',
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Nie udało się utworzyć konta.',
        )
      }

      // Backend rejestracji nie zwraca tokena,
      // więc po utworzeniu konta logujemy użytkownika.
      const loginResponse = await fetch(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      )

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        throw new Error(
          loginData.message ||
            'Konto utworzono, ale nie udało się zalogować.',
        )
      }

      await login(loginData.token)

      navigate('/dashboard')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas rejestracji.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <div className="register-card">
        <div className="register-card__header">
          <Link
            to="/"
            className="register-card__logo"
          >
            FITBOOK
          </Link>

          <p className="register-card__eyebrow">
            DOŁĄCZ DO FITBOOK
          </p>

          <h1>Utwórz konto</h1>

          <p>
            Zacznij korzystać z FITBOOK i znajdź
            swojego trenera.
          </p>
        </div>

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >
          <div className="register-form__row">
            <div className="register-form__field">
              <label htmlFor="firstName">
                Imię
              </label>

              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                placeholder="Damian"
                autoComplete="given-name"
                required
              />
            </div>

            <div className="register-form__field">
              <label htmlFor="lastName">
                Nazwisko
              </label>

              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                placeholder="Moniuszko"
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div className="register-form__field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="twoj@email.pl"
              autoComplete="email"
              required
            />
          </div>

          <div className="register-form__field">
            <label htmlFor="password">
              Hasło
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Minimum 8 znaków"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && (
            <div className="register-form__error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="register-form__button"
            disabled={loading}
          >
            {loading
              ? 'Tworzenie konta...'
              : 'Utwórz konto'}
          </button>
        </form>

        <p className="register-card__footer">
          Masz już konto?{' '}
          <Link to="/login">
            Zaloguj się
          </Link>
        </p>
      </div>
    </main>
  )
}

export default RegisterPage