import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Test: Submitting mismatched passwords shows validation error
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', token, newPassword: password }),
      })
      if (!res.ok) {
        // Test: Error message displayed on server error
        const data = await res.json()
        setError(data.error || 'Failed to reset password')
      } else {
        // Test: Successful password reset navigates to /clients
        navigate('/clients')
      }
    } catch {
      // Test: Error message displayed on network failure
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-testid="reset-password-page" className="p-6 max-sm:p-3 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Reset Password</h1>
        {/* Test: Reset password form displays password input, confirm password input, and submit button */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            data-testid="reset-password-input"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-8 px-3 text-[13px] border border-[var(--color-bg-border)] rounded bg-white focus:outline-none focus:border-[var(--color-accent)]"
          />
          <input
            data-testid="reset-confirm-input"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-8 px-3 text-[13px] border border-[var(--color-bg-border)] rounded bg-white focus:outline-none focus:border-[var(--color-accent)]"
          />
          {error && <p data-testid="reset-error-message" className="text-[11px] text-red-500">{error}</p>}
          {/* Test: Submit button shows loading state during submission */}
          <button
            data-testid="reset-submit-button"
            type="submit"
            disabled={loading}
            className="h-8 px-4 text-[13px] font-medium bg-[var(--color-accent)] text-white rounded hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
