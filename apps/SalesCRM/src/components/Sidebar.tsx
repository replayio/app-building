import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Handshake,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Deals', path: '/deals', icon: Handshake },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <aside className="sidebar" data-testid="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo" data-testid="sidebar-logo">
          <div className="sidebar-logo-icon">S</div>
          <span className="sidebar-logo-text">SalesCRM</span>
        </div>
      </div>

      <nav className="sidebar-nav" data-testid="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          const Icon = item.icon
          return (
            <button
              key={item.path}
              className={`sidebar-nav-item${isActive ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
              data-testid={`sidebar-link-${item.label.toLowerCase()}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer" ref={profileRef}>
        <button
          className="sidebar-profile-button"
          onClick={() => setProfileOpen(!profileOpen)}
          data-testid="sidebar-profile-button"
        >
          <div className="sidebar-avatar" data-testid="sidebar-profile-avatar">
            <User size={14} />
          </div>
          <span className="sidebar-profile-name">John Doe</span>
          <ChevronDown size={14} className="sidebar-profile-chevron" />
        </button>

        {profileOpen && (
          <div className="sidebar-profile-dropdown" data-testid="sidebar-profile-dropdown">
            <button
              className="sidebar-dropdown-item"
              onClick={() => { setProfileOpen(false); navigate('/settings') }}
              data-testid="sidebar-profile-option-profile"
            >
              <User size={14} />
              <span>Profile</span>
            </button>
            <button
              className="sidebar-dropdown-item"
              onClick={() => { setProfileOpen(false); navigate('/login') }}
              data-testid="sidebar-profile-option-logout"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
