import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { confirmEmail } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setErrorMessage('No confirmation token provided.')
      return
    }

    confirmEmail(token).then((result) => {
      if (result.error) {
        setStatus('error')
        setErrorMessage(result.error)
      } else {
        setStatus('success')
        setTimeout(() => navigate('/clients', { replace: true }), 2000)
      }
    })
  }, [searchParams, confirmEmail, navigate])

  return (
    <div className="flex-1 flex items-center justify-center" data-testid="confirm-email-page">
      <div className="max-w-[400px] w-full px-6">
        {status === 'loading' && (
          <div data-testid="confirm-email-loading" className="text-center">
            <p className="text-[14px] text-text-secondary">Confirming your email...</p>
          </div>
        )}
        {status === 'success' && (
          <div data-testid="confirm-email-success" className="text-center">
            <h2 className="text-[18px] font-semibold text-text-primary mb-2">Email Confirmed</h2>
            <p className="text-[13px] text-text-secondary">Your email has been confirmed and you are now signed in. Redirecting...</p>
          </div>
        )}
        {status === 'error' && (
          <div data-testid="confirm-email-error" className="text-center">
            <h2 className="text-[18px] font-semibold text-text-primary mb-2">Confirmation Failed</h2>
            <p className="text-[13px] text-red-400 mb-4">{errorMessage}</p>
            <button
              onClick={() => navigate('/clients')}
              className="h-8 px-4 rounded-[4px] bg-accent text-[13px] font-medium text-white hover:bg-accent/90 transition-colors duration-100"
            >
              Go to app
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
