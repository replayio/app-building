import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { getToken, setToken, removeToken } from '../lib/auth'

interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url: string
}

interface AuthResult {
  error: string | null
}

interface AuthContextValue {
  isLoggedIn: boolean
  loading: boolean
  user: AuthUser | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  loading: true,
  user: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, check if we have a stored token and fetch user info
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/.netlify/functions/auth?action=me')
      .then((res) => {
        if (res.ok) return res.json()
        removeToken()
        return null
      })
      .then((data) => {
        if (data && data.id) {
          setUser(data)
        }
      })
      .catch(() => {
        removeToken()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/.netlify/functions/auth?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || 'Sign up failed' }
      }
      setToken(data.access_token)
      setUser(data.user)
      return { error: null }
    } catch {
      return { error: 'Sign up failed' }
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/.netlify/functions/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || 'Sign in failed' }
      }
      setToken(data.access_token)
      setUser(data.user)
      return { error: null }
    } catch {
      return { error: 'Sign in failed' }
    }
  }, [])

  const signOut = useCallback(() => {
    removeToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!user,
        loading,
        user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
