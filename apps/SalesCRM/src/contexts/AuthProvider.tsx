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
  needsConfirmation?: boolean
  message?: string
}

interface ForgotPasswordResult {
  error: string | null
  message?: string
}

interface ResetPasswordResult {
  error: string | null
}

interface ConfirmEmailResult {
  error: string | null
}

interface AuthContextValue {
  isLoggedIn: boolean
  loading: boolean
  user: AuthUser | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => void
  forgotPassword: (email: string) => Promise<ForgotPasswordResult>
  resetPassword: (token: string, password: string) => Promise<ResetPasswordResult>
  confirmEmail: (token: string) => Promise<ConfirmEmailResult>
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  loading: true,
  user: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: () => {},
  forgotPassword: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  confirmEmail: async () => ({ error: null }),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

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
      const text = await res.text()
      let data: Record<string, unknown>
      try { data = JSON.parse(text) } catch { data = {} }
      if (!res.ok) {
        return { error: (data.error as string) || 'Sign up failed' }
      }
      if (data.needsConfirmation) {
        return { error: null, needsConfirmation: true, message: data.message as string }
      }
      setToken(data.access_token as string)
      setUser(data.user as AuthUser)
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

  const forgotPassword = useCallback(async (email: string): Promise<ForgotPasswordResult> => {
    try {
      const res = await fetch('/.netlify/functions/auth?action=forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || 'Request failed' }
      }
      return { error: null, message: data.message }
    } catch {
      return { error: 'Request failed' }
    }
  }, [])

  const resetPassword = useCallback(async (token: string, password: string): Promise<ResetPasswordResult> => {
    try {
      const res = await fetch('/.netlify/functions/auth?action=reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || 'Password reset failed' }
      }
      setToken(data.access_token)
      setUser(data.user)
      return { error: null }
    } catch {
      return { error: 'Password reset failed' }
    }
  }, [])

  const confirmEmail = useCallback(async (token: string): Promise<ConfirmEmailResult> => {
    try {
      const res = await fetch('/.netlify/functions/auth?action=confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || 'Email confirmation failed' }
      }
      setToken(data.access_token)
      setUser(data.user)
      return { error: null }
    } catch {
      return { error: 'Email confirmation failed' }
    }
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
        forgotPassword,
        resetPassword,
        confirmEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
