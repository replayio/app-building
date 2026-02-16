import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_AUTH_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_AUTH_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const auth = supabase.auth

// The Supabase storage key for session data
const SUPABASE_STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`

// Patch window.fetch to automatically inject Authorization header
// on requests to /.netlify/functions/
const originalFetch = window.fetch.bind(window)
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  if (url.includes('/.netlify/functions/')) {
    // Try Supabase session first, then fall back to localStorage directly
    // (localStorage fallback is needed for test mode where tokens aren't set via real auth)
    let accessToken: string | null = null
    try {
      const { data: { session } } = await supabase.auth.getSession()
      accessToken = session?.access_token ?? null
    } catch {
      // Supabase session retrieval failed
    }

    if (!accessToken) {
      try {
        const stored = localStorage.getItem(SUPABASE_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          accessToken = parsed.access_token ?? null
        }
      } catch {
        // localStorage parsing failed
      }
    }

    if (accessToken) {
      const headers = new Headers(init?.headers)
      headers.set('Authorization', `Bearer ${accessToken}`)
      return originalFetch(input, { ...init, headers })
    }
  }
  return originalFetch(input, init)
}
