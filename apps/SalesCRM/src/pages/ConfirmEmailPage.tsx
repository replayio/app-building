import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('No confirmation token provided')
      return
    }

    const confirm = async () => {
      try {
        const res = await fetch('/.netlify/functions/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'confirm-email', token }),
        })
        if (!res.ok) {
          const data = await res.json()
          setStatus('error')
          setError(data.error || 'Failed to confirm email')
        } else {
          const data = await res.json()
          if (data.token) {
            localStorage.setItem('token', data.token)
          }
          setStatus('success')
          setTimeout(() => navigate('/clients'), 2000)
        }
      } catch {
        setStatus('error')
        setError('Network error')
      }
    }

    confirm()
  }, [token, navigate])

  return (
    <div data-testid="confirm-email-page" className="p-6 max-sm:p-3 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm text-center">
        {status === 'loading' && (
          <p data-testid="confirm-loading" className="text-[13px] text-[var(--color-text-muted)]">Confirming your email...</p>
        )}
        {status === 'success' && (
          <div>
            <p data-testid="confirm-success" className="text-[13px] text-[var(--color-text-primary)]">
              Email confirmed! Redirecting...
            </p>
          </div>
        )}
        {status === 'error' && (
          <p data-testid="confirm-error" className="text-[13px] text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}
