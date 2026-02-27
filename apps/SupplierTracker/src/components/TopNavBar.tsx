import { useNavigate, useLocation } from "react-router-dom";
import "./TopNavBar.css";

const navItems = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "suppliers", label: "Suppliers", path: "/#suppliers" },
  { key: "orders", label: "Orders", path: "/#orders" },
  { key: "inventory", label: "Inventory", path: "/#inventory" },
];

export function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.key === "dashboard") return location.pathname === "/";
    if (item.key === "suppliers") return location.pathname.startsWith("/suppliers");
    if (item.key === "orders") return location.pathname.startsWith("/orders");
    return false;
  };

  return (
    <header data-testid="top-nav" className="top-nav">
      <div className="top-nav-left">
        {/* Test: Click App Logo Navigates to Dashboard */}
        <a
          data-testid="top-nav-logo"
          className="top-nav-logo"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <svg
            className="top-nav-logo-icon"
            width="24"
            height="24"
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
          SupplyChain Pro
        </a>

        <nav data-testid="top-nav-links" className="top-nav-links">
          {/* Tests: Click Dashboard Nav Link Navigates to Dashboard, Click Suppliers Nav Link Scrolls to Suppliers Section, Click Orders Nav Link Scrolls to Orders Section, Click Inventory Nav Link Scrolls to Inventory Section, Active Nav Link Highlights Current Page */}
          {navItems.map((item) => (
            <a
              key={item.key}
              data-testid={`top-nav-${item.key}`}
              className={`top-nav-link${isActive(item) ? " top-nav-link--active" : ""}`}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                const hashIndex = item.path.indexOf("#");
                const hash = hashIndex >= 0 ? item.path.substring(hashIndex + 1) : "";
                navigate("/");
                if (hash) {
                  requestAnimationFrame(() => {
                    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
                  });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="top-nav-right">
        {/* Test: Display User Profile Button */}
        <button data-testid="top-nav-user" className="top-nav-user-btn">
          <div className="top-nav-avatar">U</div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
