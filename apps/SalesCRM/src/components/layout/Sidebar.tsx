import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Handshake,
  CheckSquare,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  { to: '/clients', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/deals', label: 'Deals', icon: Handshake },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export function Sidebar() {
  return (
    <aside className="w-[244px] min-h-screen bg-sidebar flex flex-col justify-between py-3 px-3">
      <div>
        <div className="px-2 py-2 mb-4">
          <span className="text-[14px] font-semibold text-text-secondary">Sales CRM</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
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
      <div>
        <NavLink
          to="/settings"
          className="flex items-center gap-2.5 h-7 px-2 rounded-[4px] text-[13px] font-[450] text-text-secondary hover:bg-sidebar-hover transition-colors duration-100"
        >
          <Settings size={16} strokeWidth={1.75} />
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
