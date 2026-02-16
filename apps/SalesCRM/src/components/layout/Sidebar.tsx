import { NavLink } from 'react-router-dom'
import {
  Users,
  Handshake,
  CheckSquare,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthProvider'

const navItems = [
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/deals', label: 'Deals', icon: Handshake },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
]

export function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside data-testid="sidebar" className="w-[244px] min-h-screen bg-sidebar flex flex-col justify-between py-3 px-3">
      <div>
        <div className="px-2 py-2 mb-4">
          <span className="text-[14px] font-semibold text-text-secondary">Sales CRM</span>
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

      {user && (
        <div className="border-t border-border pt-3 mt-3">
          <div className="flex items-center gap-2 px-2 mb-2">
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
            <span className="text-[12px] text-text-secondary truncate" data-testid="sidebar-user-name">
              {user.name}
            </span>
          </div>
          <button
            data-testid="sidebar-sign-out"
            onClick={signOut}
            className="flex items-center gap-2.5 h-7 px-2 w-full rounded-[4px] text-[13px] font-[450] text-text-secondary hover:bg-sidebar-hover transition-colors duration-100"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
