import { useEffect } from 'react'

export function AuthCallbackPage() {
  useEffect(() => {
    // The Supabase client auto-detects tokens in the URL hash
    // via onAuthStateChange. Post a message to the opener window
    // so it can pick up the new session, then close this popup.
    const timer = setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage({ type: 'auth-callback' }, window.location.origin)
        window.close()
      } else {
        // Fallback: if not opened as popup, redirect to home
        window.location.href = '/'
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base" data-testid="auth-callback-page">
      <div className="text-center">
        <p className="text-[14px] text-text-primary">Completing sign in...</p>
      </div>
    </div>
  )
}
