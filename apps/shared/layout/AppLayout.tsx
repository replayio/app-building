import React from "react";
import { Sidebar, type NavItem } from "./Sidebar";
import "../styles/tokens.css";
import "../styles/layout.css";

export interface AppLayoutProps {
  /** App name displayed in the sidebar header. */
  appName: string;
  /** Navigation items for the sidebar. */
  navItems: NavItem[];
  /** Currently active path for highlighting the active nav item. */
  activePath: string;
  /** Called when a nav item is clicked. */
  onNavigate: (path: string) => void;
  /** Optional header content rendered above the main content area (e.g., breadcrumbs, action buttons). */
  header?: React.ReactNode;
  /** Main page content. */
  children: React.ReactNode;
  /** Optional user info for the sidebar footer. */
  userName?: string;
  /** Called when the user clicks log out. */
  onLogout?: () => void;
}

export function AppLayout({
  appName,
  navItems,
  activePath,
  onNavigate,
  header,
  children,
  userName,
  onLogout,
}: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar
        appName={appName}
        navItems={navItems}
        activePath={activePath}
        onNavigate={onNavigate}
        userName={userName}
        onLogout={onLogout}
      />
      <main className="app-main">
        {header && <div className="app-main-header">{header}</div>}
        <div className="app-main-content">{children}</div>
      </main>
    </div>
  );
}
