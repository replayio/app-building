import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
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
  signIn: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  loading: true,
  user: null,
  signIn: () => {},
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

  // Listen for auth-callback messages from popup window
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'auth-callback') {
        // Popup completed auth — refresh session
        auth.getSession().then(({ data: { session: s } }) => {
          setSession(s)
          if (!s) {
            setHasStoredToken(getStoredSession())
          }
        })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const isLoggedIn = !!session || hasStoredToken
  const { data: userInfo } = useGetUserInfoQuery(undefined, { skip: !isLoggedIn })

  const signIn = useCallback(() => {
    const callbackUrl = `${window.location.origin}/auth/callback`
    const authUrl = `https://auth.nut.new/functions/v1/oauth/start?provider=google&redirect_to=${encodeURIComponent(callbackUrl)}`
    const width = 500
    const height = 600
    const left = window.screenX + (window.innerWidth - width) / 2
    const top = window.screenY + (window.innerHeight - height) / 2
    window.open(authUrl, 'auth-popup', `width=${width},height=${height},left=${left},top=${top}`)
  }, [])

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
        signIn,
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
