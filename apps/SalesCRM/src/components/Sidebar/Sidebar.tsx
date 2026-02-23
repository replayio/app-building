import SidebarNavLinks from './SidebarNavLinks'
import SidebarUserArea from './SidebarUserArea'

export default function Sidebar() {
  return (
    <aside
      data-testid="sidebar"
      className="w-[var(--sidebar-width)] h-screen flex-shrink-0 bg-[var(--color-bg-sidebar)] flex flex-col sticky top-0 overflow-y-auto"
    >
      <div className="px-4 py-3">
        <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
          Sales CRM
        </span>
      </div>
      <SidebarUserArea />
      <nav className="flex-1 px-2 py-1">
        <SidebarNavLinks />
      </nav>
    </aside>
  )
}
