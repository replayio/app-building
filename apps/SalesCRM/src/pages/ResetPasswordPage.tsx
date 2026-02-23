import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!token) {
      setError('No reset token provided')
      return
    }

    setLoading(true)
    const result = await resetPassword(token, password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/clients', { replace: true }), 2000)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 max-sm:p-3" data-testid="reset-password-page">
      <div className="max-w-[400px] w-full px-6">
        {!token ? (
          <div data-testid="reset-password-error" className="text-center">
            <h2 className="text-[18px] font-semibold text-text-primary mb-2">Invalid Link</h2>
            <p className="text-[13px] text-red-400 mb-4">No reset token provided.</p>
            <button
              data-testid="reset-password-go-to-app"
              onClick={() => navigate('/clients')}
              className="h-8 px-4 rounded-[4px] bg-accent text-[13px] font-medium text-white hover:bg-accent/90 transition-colors duration-100"
            >
              Go to app
            </button>
          </div>
        ) : success ? (
          <div data-testid="reset-password-success" className="text-center">
            <h2 className="text-[18px] font-semibold text-text-primary mb-2">Password Reset</h2>
            <p className="text-[13px] text-text-secondary">Your password has been updated and you are now signed in. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} data-testid="reset-password-form" className="flex flex-col gap-3">
            <h2 className="text-[18px] font-semibold text-text-primary">Reset Password</h2>
            <p className="text-[13px] text-text-secondary mb-2">Enter your new password below.</p>
            <input
              data-testid="reset-password-input"
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-9 px-3 rounded-[4px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
            <input
              data-testid="reset-password-confirm-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-9 px-3 rounded-[4px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
            {error && (
              <p data-testid="reset-password-error" className="text-[12px] text-red-400">{error}</p>
            )}
            <button
              data-testid="reset-password-submit"
              type="submit"
              disabled={loading}
              className="h-9 rounded-[4px] bg-accent text-[13px] font-medium text-white hover:bg-accent/90 transition-colors duration-100 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
