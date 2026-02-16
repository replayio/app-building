import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth } from '../lib/auth'
import { useGetUserInfoQuery } from '../store/authSlice'
import type { Session } from '@supabase/supabase-js'

// The Supabase storage key — matches the one in auth.ts
const supabaseUrl = import.meta.env.VITE_AUTH_SUPABASE_URL
const SUPABASE_STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`

interface AuthContextValue {
  isLoggedIn: boolean
  loading: boolean
  user: { id: string; email: string; name: string; avatar_url: string } | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  loading: true,
  user: null,
  signOut: async () => {},
})

/**
 * Check localStorage for a session token (used as fallback in test mode
 * where tokens aren't set via real Supabase auth).
 */
function getStoredSession(): boolean {
  try {
    const stored = localStorage.getItem(SUPABASE_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return !!parsed.access_token
    }
  } catch {
    // ignore
  }
  return false
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [hasStoredToken, setHasStoredToken] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      // If Supabase didn't find a session, check localStorage directly
      if (!s) {
        setHasStoredToken(getStoredSession())
      }
      setLoading(false)
    })

    const { data: { subscription } } = auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) {
        setHasStoredToken(getStoredSession())
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // User is logged in if Supabase has a session OR we have a stored token
  const isLoggedIn = !!session || hasStoredToken
  const { data: userInfo } = useGetUserInfoQuery(undefined, { skip: !isLoggedIn })

  async function signOut() {
    await auth.signOut()
    localStorage.removeItem(SUPABASE_STORAGE_KEY)
    setSession(null)
    setHasStoredToken(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user: userInfo ?? null,
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
