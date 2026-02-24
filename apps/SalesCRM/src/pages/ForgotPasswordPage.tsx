import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot-password', email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send reset email')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-testid="forgot-password-page" className="p-6 max-sm:p-3 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm">
        {/* Forgot password form displays email input and submit button */}
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Forgot Password</h1>
        {submitted ? (
          /* Submitting email shows success message */
          <p data-testid="reset-email-sent" className="text-[13px] text-[var(--color-text-muted)]">
            If an account exists with that email, a password reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Forgot password form displays email input and submit button */}
            <input
              data-testid="forgot-email-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-8 px-3 text-[13px] border border-[var(--color-bg-border)] rounded bg-white focus:outline-none focus:border-[var(--color-accent)]"
            />
            {/* Error message displayed on server error / Error message displayed on network failure */}
            {error && <p data-testid="forgot-error-message" className="text-[11px] text-red-500">{error}</p>}
            {/* Submit button shows loading state during submission */}
            <button
              data-testid="forgot-submit-button"
              type="submit"
              disabled={loading}
              className="h-8 px-4 text-[13px] font-medium bg-[var(--color-accent)] text-white rounded hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
