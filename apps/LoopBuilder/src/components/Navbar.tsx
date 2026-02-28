import { Link, useLocation } from 'react-router-dom';
import { Cpu, User } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar" data-testid="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">
          <Cpu size={18} />
        </span>
        AutoBuild <span className="brand-highlight">AI</span>
      </Link>
      <div className="navbar-links">
        <Link
          to="/"
          className={location.pathname === '/' ? 'active' : ''}
          data-testid="nav-dashboard"
        >
          Dashboard
        </Link>
        <Link
          to="/"
          className={location.pathname === '/' ? 'active' : ''}
          data-testid="nav-my-apps"
        >
          My Apps
        </Link>
        <span className="navbar-avatar" data-testid="nav-avatar">
          <User size={18} />
        </span>
      </div>
    </nav>
  );
}
