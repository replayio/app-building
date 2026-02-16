import { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../lib/auth'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = await auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      })
      if (err) {
        setError(err.message)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignup() {
    const callbackUrl = `${window.location.origin}/auth/callback`
    window.location.href = `https://auth.nut.new/functions/v1/oauth/start?provider=google&redirect_to=${encodeURIComponent(callbackUrl)}`
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base" data-testid="register-page">
        <div className="w-full max-w-[400px] p-8 text-center">
          <h1 className="text-[20px] font-semibold text-text-primary mb-4">Check your email</h1>
          <p className="text-[13px] text-text-muted mb-4">
            We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
          </p>
          <Link to="/login" className="text-[13px] text-accent hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base" data-testid="register-page">
      <div className="w-full max-w-[400px] p-8">
        <div className="text-center mb-8">
          <h1 className="text-[20px] font-semibold text-text-primary mb-2">Create account</h1>
          <p className="text-[13px] text-text-muted">Get started with Sales CRM</p>
        </div>

        <button
          data-testid="register-google-button"
          onClick={handleGoogleSignup}
          className="w-full h-[40px] mb-4 text-[13px] font-medium text-text-primary border border-border rounded-[6px] hover:bg-hover transition-colors duration-100 flex items-center justify-center gap-2"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-[12px] text-text-muted">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Full Name</label>
            <input
              data-testid="register-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full h-[38px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[6px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Email</label>
            <input
              data-testid="register-email-input"
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
              data-testid="register-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="w-full h-[38px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[6px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p data-testid="register-error" className="text-[12px] text-red-500">{error}</p>
          )}

          <button
            data-testid="register-submit-button"
            type="submit"
            disabled={loading}
            className="w-full h-[38px] text-[13px] font-medium text-white bg-accent rounded-[6px] hover:opacity-90 disabled:opacity-40 transition-opacity duration-100"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-[12px] text-text-muted mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline" data-testid="register-login-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
