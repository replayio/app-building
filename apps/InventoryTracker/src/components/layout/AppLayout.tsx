import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowLeftRight,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, testId: 'nav-dashboard' },
  { to: '/accounts', label: 'Accounts', icon: Building2, testId: 'nav-accounts' },
  { to: '/materials', label: 'Materials', icon: Package, testId: 'nav-materials' },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, testId: 'nav-transactions' },
];

export default function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar" data-testid="sidebar">
        <div className="sidebar-header">
          <h1>Inventory Tracker</h1>
        </div>
        <nav className="sidebar-nav" data-testid="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
              data-testid={item.testId}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content" data-testid="main-content">
        <Outlet />
      </main>
    </div>
  );
}
