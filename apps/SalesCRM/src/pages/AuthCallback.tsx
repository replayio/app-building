import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // The Supabase client auto-detects tokens in the URL hash
    // via onAuthStateChange. Just redirect to home after a short delay.
    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 1000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base" data-testid="auth-callback-page">
      <div className="text-center">
        <p className="text-[14px] text-text-primary">Completing sign in...</p>
      </div>
    </div>
  )
}
