import { useNavigate, useLocation } from "react-router-dom";

const navLinks = [
  { key: "accounts", label: "Accounts", path: "/accounts" },
  { key: "materials", label: "Materials", path: "/materials" },
  { key: "batches", label: "Batches", path: "/batches" },
  { key: "transactions", label: "Transactions", path: "/transactions" },
  { key: "settings", label: "Settings", path: "/settings" },
];

export function NavigationHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header data-testid="navbar" className="navbar">
      <a
        data-testid="navbar-logo"
        className={`navbar-logo${isActive("/") ? " navbar-link--active" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
        href="/"
      >
        <svg
          className="navbar-logo-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        InventoryFlow
      </a>

      <nav data-testid="navbar-links" className="navbar-links">
        {navLinks.map((link) => (
          <a
            key={link.key}
            data-testid={`navbar-link-${link.key}`}
            className={`navbar-link${isActive(link.path) ? " navbar-link--active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(link.path);
            }}
            href={link.path}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div data-testid="navbar-actions" className="navbar-actions">
        <div data-testid="navbar-user" className="navbar-user">
          <div data-testid="navbar-avatar" className="navbar-avatar">A</div>
          <span data-testid="navbar-user-name" className="navbar-user-name">Admin</span>
        </div>
      </div>
    </header>
  );
}
