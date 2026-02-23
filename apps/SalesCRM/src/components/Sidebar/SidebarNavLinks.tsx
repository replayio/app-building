import { useLocation, Link } from 'react-router-dom'
import {
  Building2,
  Users,
  Handshake,
  CheckSquare,
  UserCircle,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'Clients', path: '/clients', icon: Building2 },
  { label: 'Contacts', path: '/contacts', icon: Users },
  { label: 'Deals', path: '/deals', icon: Handshake },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Team', path: '/users', icon: UserCircle },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function SidebarNavLinks() {
  const location = useLocation()

  return (
    <ul data-testid="sidebar-nav" className="flex flex-col gap-0.5">
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + '/')
        const Icon = item.icon

        return (
          <li key={item.path}>
            <Link
              to={item.path}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
              className={`flex items-center gap-2 h-7 px-2 rounded text-[13px] font-[450] transition-colors duration-100 ${
                isActive
                  ? 'bg-[var(--color-sidebar-active)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
