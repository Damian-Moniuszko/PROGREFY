import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    const token = searchParams.get('token')
    const mode = searchParams.get('mode')

    if (!token) {
      setError('Nie udało się zakończyć logowania.')
      return
    }

    void login(token)
      .then(() => {
        navigate(mode === 'connect' ? '/settings?oauth=connected' : '/profile', { replace: true })
      })
      .catch(() => {
        setError('Nie udało się zalogować użytkownika.')
      })
  }, [login, navigate, searchParams])

  if (error) {
    return (
      <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', background: 'var(--color-black)', color: '#fff', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Nie udało się zalogować</h1>
          <p style={{ color: '#999' }}>{error}</p>
          <button type="button" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>Wróć do logowania</button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', background: 'var(--color-black)', color: '#fff' }}>
      <p>Kończymy logowanie...</p>
    </main>
  )
}

export default OAuthCallbackPage
