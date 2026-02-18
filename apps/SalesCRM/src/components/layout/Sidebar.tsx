import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Users,
  Handshake,
  CheckSquare,
  LogOut,
  LogIn,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthProvider'

const navItems = [
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/deals', label: 'Deals', icon: Handshake },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
]

export function Sidebar() {
  const { user, isLoggedIn, signIn, signUp, signOut } = useAuth()
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)
    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)
    setAuthLoading(false)
    if (result.error) {
      setAuthError(result.error)
    } else {
      setShowAuthForm(false)
      setEmail('')
      setPassword('')
    }
  }

  return (
    <aside data-testid="sidebar" className="w-[244px] min-h-screen bg-sidebar flex flex-col justify-between py-3 px-3">
      <div>
        <div className="px-2 py-2 mb-2">
          <span className="text-[14px] font-semibold text-text-secondary">Sales CRM</span>
        </div>

        <div className="px-2 mb-4" data-testid="sidebar-user-area">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                  data-testid="sidebar-user-avatar"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[11px] font-medium text-accent" data-testid="sidebar-user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[12px] text-text-secondary truncate flex-1" data-testid="sidebar-user-name">
                {user.name}
              </span>
              <button
                data-testid="sidebar-sign-out"
                onClick={signOut}
                className="p-1 rounded-[4px] text-text-muted hover:bg-sidebar-hover hover:text-text-secondary transition-colors duration-100"
                title="Sign out"
              >
                <LogOut size={14} strokeWidth={1.75} />
              </button>
            </div>
          ) : showAuthForm ? (
            <form onSubmit={handleSubmit} data-testid="sidebar-auth-form" className="flex flex-col gap-2">
              <input
                data-testid="auth-email-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-7 px-2 rounded-[4px] bg-surface border border-border text-[12px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
              />
              <input
                data-testid="auth-password-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-7 px-2 rounded-[4px] bg-surface border border-border text-[12px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
              />
              {authError && (
                <p data-testid="auth-error" className="text-[11px] text-red-400">{authError}</p>
              )}
              <button
                data-testid="auth-submit-button"
                type="submit"
                disabled={authLoading}
                className="h-7 rounded-[4px] bg-accent text-[12px] font-medium text-white hover:bg-accent/90 transition-colors duration-100 disabled:opacity-50"
              >
                {authLoading ? '...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
              <button
                data-testid="auth-toggle-mode"
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setAuthError(null) }}
                className="text-[11px] text-text-muted hover:text-text-secondary transition-colors duration-100"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAuthForm(false); setAuthError(null) }}
                className="text-[11px] text-text-muted hover:text-text-secondary transition-colors duration-100"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              data-testid="sidebar-sign-in"
              onClick={() => { setShowAuthForm(true); setIsSignUp(false); setAuthError(null) }}
              className="flex items-center gap-2 h-7 px-0 rounded-[4px] text-[12px] font-[450] text-text-muted hover:text-text-secondary transition-colors duration-100"
            >
              <LogIn size={14} strokeWidth={1.75} />
              Sign in
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              data-testid={`sidebar-nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 h-7 px-2 rounded-[4px] text-[13px] font-[450] transition-colors duration-100 ${
                  isActive
                    ? 'bg-sidebar-active text-text-primary'
                    : 'text-text-secondary hover:bg-sidebar-hover'
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
