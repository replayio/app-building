import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = await auth.signInWithPassword({ email, password })
      if (err) {
        setError(err.message)
      } else {
        navigate('/')
      }
    } catch {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    const callbackUrl = `${window.location.origin}/auth/callback`
    window.location.href = `https://auth.nut.new/functions/v1/oauth/start?provider=google&redirect_to=${encodeURIComponent(callbackUrl)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base" data-testid="login-page">
      <div className="w-full max-w-[400px] p-8">
        <div className="text-center mb-8">
          <h1 className="text-[20px] font-semibold text-text-primary mb-2">Sales CRM</h1>
          <p className="text-[13px] text-text-muted">Sign in to your account</p>
        </div>

        <button
          data-testid="login-google-button"
          onClick={handleGoogleLogin}
          className="w-full h-[40px] mb-4 text-[13px] font-medium text-text-primary border border-border rounded-[6px] hover:bg-hover transition-colors duration-100 flex items-center justify-center gap-2"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-[12px] text-text-muted">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Email</label>
            <input
              data-testid="login-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-[38px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[6px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Password</label>
            <input
              data-testid="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full h-[38px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[6px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p data-testid="login-error" className="text-[12px] text-red-500">{error}</p>
          )}

          <button
            data-testid="login-submit-button"
            type="submit"
            disabled={loading}
            className="w-full h-[38px] text-[13px] font-medium text-white bg-accent rounded-[6px] hover:opacity-90 disabled:opacity-40 transition-opacity duration-100"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[12px] text-text-muted mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-accent hover:underline" data-testid="login-register-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
