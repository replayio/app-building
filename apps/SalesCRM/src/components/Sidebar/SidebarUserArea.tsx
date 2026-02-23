import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { signIn, signUp, signOut, clearError } from '../../store/slices/authSlice'

export default function SidebarUserArea() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useAppSelector((state) => state.auth)

  const [showForm, setShowForm] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (isSignUp) {
      const result = await dispatch(signUp({ email, password, name }))
      if (signUp.fulfilled.match(result)) {
        if (!result.payload.token) {
          setMessage('Please check your email to confirm your account.')
        } else {
          setShowForm(false)
        }
      }
    } else {
      const result = await dispatch(signIn({ email, password }))
      if (signIn.fulfilled.match(result)) {
        setShowForm(false)
      }
    }
  }

  const handleSignOut = () => {
    dispatch(signOut())
  }

  if (user) {
    return (
      <div data-testid="user-area" className="px-3 py-2 flex items-center gap-2">
        <div
          data-testid="user-avatar"
          className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-[var(--color-text-inverse)] flex items-center justify-center text-[11px] font-medium flex-shrink-0"
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span data-testid="user-name" className="text-[13px] text-[var(--color-text-secondary)] truncate flex-1">
          {user.name}
        </span>
        <button
          data-testid="sign-out-button"
          onClick={handleSignOut}
          className="p-1 rounded hover:bg-[var(--color-hover)] text-[var(--color-text-muted)]"
        >
          <LogOut size={14} />
        </button>
      </div>
    )
  }

  if (!showForm) {
    return (
      <div className="px-3 py-2">
        <button
          data-testid="sign-in-button"
          onClick={() => {
            setShowForm(true)
            dispatch(clearError())
          }}
          className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div data-testid="auth-form" className="px-3 py-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {isSignUp && (
          <input
            data-testid="auth-name-input"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-7 px-2 text-[13px] border border-[var(--color-bg-border)] rounded bg-white focus:outline-none focus:border-[var(--color-accent)]"
          />
        )}
        <input
          data-testid="auth-email-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-7 px-2 text-[13px] border border-[var(--color-bg-border)] rounded bg-white focus:outline-none focus:border-[var(--color-accent)]"
          required
        />
        <input
          data-testid="auth-password-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-7 px-2 text-[13px] border border-[var(--color-bg-border)] rounded bg-white focus:outline-none focus:border-[var(--color-accent)]"
          required
        />
        <button
          data-testid="auth-submit-button"
          type="submit"
          disabled={loading}
          className="h-7 px-3 text-[13px] font-medium bg-[var(--color-accent)] text-white rounded hover:opacity-90 disabled:opacity-60"
        >
          {loading ? '...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
        {error && (
          <p data-testid="auth-error" className="text-[11px] text-red-500">{error}</p>
        )}
        {message && (
          <p data-testid="auth-message" className="text-[11px] text-[var(--color-text-muted)]">{message}</p>
        )}
        <div className="flex items-center justify-between">
          <button
            data-testid="forgot-password-link"
            type="button"
            onClick={() => navigate('/auth/forgot-password')}
            className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
          >
            Forgot password?
          </button>
          <button
            data-testid="auth-toggle"
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              dispatch(clearError())
              setMessage('')
            }}
            className="text-[11px] text-[var(--color-accent)]"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  )
}
