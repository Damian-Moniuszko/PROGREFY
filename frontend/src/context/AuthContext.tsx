import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'CLIENT' | 'TRAINER'
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  )

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const storedToken =
        localStorage.getItem('token')

      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          'http://localhost:3000/api/me',
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        )

        if (!response.ok) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          return
        }

        const data = await response.json()

        setUser(data.user)
        setToken(storedToken)
      } catch {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  async function login(newToken: string) {
    localStorage.setItem('token', newToken)
    setToken(newToken)

    const response = await fetch(
      'http://localhost:3000/api/me',
      {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      },
    )

    if (!response.ok) {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)

      throw new Error(
        'Nie udało się pobrać danych użytkownika.',
      )
    }

    const data = await response.json()

    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}