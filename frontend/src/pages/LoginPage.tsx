import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Nieprawidłowy email lub hasło.',
        )
      }

      await login(data.token)

      navigate('/dashboard')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas logowania.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <Link to="/" className="login-card__logo">
            FITBOOK
          </Link>

          <p className="login-card__eyebrow">
            WITAJ PONOWNIE
          </p>

          <h1>Zaloguj się</h1>

          <p>
            Zaloguj się do swojego konta FITBOOK.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="login-form__field">
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

          <div className="login-form__field">
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
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login-form__error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-form__button"
            disabled={loading}
          >
            {loading
              ? 'Logowanie...'
              : 'Zaloguj się'}
          </button>
        </form>

        <p className="login-card__footer">
          Nie masz jeszcze konta?{' '}
          <Link to="/register">
            Załóż konto
          </Link>
        </p>
      </div>
    </main>
  )
}

export default LoginPage