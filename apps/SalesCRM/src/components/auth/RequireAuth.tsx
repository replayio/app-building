import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthProvider'

export function RequireAuth() {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <p className="text-[14px] text-text-muted">Loading...</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
