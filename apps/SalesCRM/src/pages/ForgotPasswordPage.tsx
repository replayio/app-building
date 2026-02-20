import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await forgotPassword(email)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSubmitted(true)
      setMessage(result.message || 'If an account with that email exists, a password reset link has been sent.')
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center" data-testid="forgot-password-page">
      <div className="max-w-[400px] w-full px-6">
        {submitted ? (
          <div data-testid="forgot-password-success" className="text-center">
            <h2 className="text-[18px] font-semibold text-text-primary mb-2">Check Your Email</h2>
            <p className="text-[13px] text-text-secondary mb-4">{message}</p>
            <button
              data-testid="forgot-password-back"
              onClick={() => navigate('/clients')}
              className="h-8 px-4 rounded-[4px] bg-accent text-[13px] font-medium text-white hover:bg-accent/90 transition-colors duration-100"
            >
              Back to app
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} data-testid="forgot-password-form" className="flex flex-col gap-3">
            <h2 className="text-[18px] font-semibold text-text-primary">Forgot Password</h2>
            <p className="text-[13px] text-text-secondary mb-2">Enter your email address and we'll send you a link to reset your password.</p>
            <input
              data-testid="forgot-password-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 px-3 rounded-[4px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
            {error && (
              <p data-testid="forgot-password-error" className="text-[12px] text-red-400">{error}</p>
            )}
            <button
              data-testid="forgot-password-submit"
              type="submit"
              disabled={loading}
              className="h-9 rounded-[4px] bg-accent text-[13px] font-medium text-white hover:bg-accent/90 transition-colors duration-100 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              data-testid="forgot-password-back-to-signin"
              type="button"
              onClick={() => navigate('/clients')}
              className="text-[12px] text-text-muted hover:text-text-secondary transition-colors duration-100"
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
