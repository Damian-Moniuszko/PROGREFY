import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function GoogleCallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    async function handleGoogleLogin() {
      const params = new URLSearchParams(
        window.location.search,
      )

      const token = params.get('token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        await login(token)

        navigate('/')
      } catch (error) {
        console.error(error)
        navigate('/login')
      }
    }

    handleGoogleLogin()
  }, [login, navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Logowanie przez Google...
    </div>
  )
}

export default GoogleCallbackPage