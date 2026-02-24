import React from "react";

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  appName: string;
  navItems: NavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  userName?: string;
  onLogout?: () => void;
}

export function Sidebar({
  appName,
  navItems,
  activePath,
  onNavigate,
  userName,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-app-name">{appName}</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.path}
              className={`sidebar-nav-item${isActive ? " sidebar-nav-item--active" : ""}`}
              onClick={() => onNavigate(item.path)}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon && <span className="sidebar-nav-icon">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {userName && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="sidebar-user-name">{userName}</span>
          </div>
          {onLogout && (
            <button className="sidebar-logout-btn" onClick={onLogout}>
              Log Out
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
