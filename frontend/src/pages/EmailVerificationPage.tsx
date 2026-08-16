import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './EmailVerificationPage.css'

function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  const token = searchParams.get('token')
  const pending = searchParams.get('pending')

  const [status, setStatus] = useState<
    'pending' | 'loading' | 'success' | 'error'
  >(token ? 'loading' : 'pending')

  const [message, setMessage] = useState(
    pending
      ? 'Konto zostało utworzone. Sprawdź swoją skrzynkę e-mail i kliknij link aktywacyjny.'
      : '',
  )

  useEffect(() => {
    if (!token) {
      return
    }

    async function verifyEmail() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: 'POST',
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Nie udało się potwierdzić adresu e-mail.',
          )
        }

        if (data.token) {
          await login(data.token)
        }

        setStatus('success')
        setMessage(
          data.message || 'E-mail został potwierdzony.',
        )

        setTimeout(() => {
          navigate('/')
        }, 2000)
      } catch (error) {
        setStatus('error')

        setMessage(
          error instanceof Error
            ? error.message
            : 'Nie udało się potwierdzić adresu e-mail.',
        )
      }
    }

    verifyEmail()
  }, [token, login, navigate])

  return (
    <main className="email-verification-page">
      <section className="email-verification-card">
        <Link to="/" className="email-verification-logo">
          PROGREFY
        </Link>

        <div className={`email-verification-icon ${status}`}>
          {status === 'loading'
            ? '...'
            : status === 'success'
              ? '✓'
              : status === 'pending'
                ? '✉'
                : '!'}
        </div>

        <p className="email-verification-label">
          WERYFIKACJA E-MAILA
        </p>

        <h1>
          {status === 'pending'
            ? 'Sprawdź swoją skrzynkę'
            : status === 'loading'
              ? 'Potwierdzamy adres...'
              : status === 'success'
                ? 'E-mail potwierdzony'
                : 'Weryfikacja nieudana'}
        </h1>

        <p className="email-verification-text">
          {message}
        </p>

        {status === 'success' && (
          <p className="email-verification-text">
            Za chwilę przejdziesz na stronę główną.
          </p>
        )}

        {status === 'error' && (
          <Link
            to="/register"
            className="email-verification-button"
          >
            Wróć do rejestracji
          </Link>
        )}
      </section>
    </main>
  )
}

export default EmailVerificationPage