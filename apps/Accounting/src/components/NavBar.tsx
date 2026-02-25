import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { NewTransactionModal } from "./NewTransactionModal";
import { Breadcrumb } from "../../../shared/components/Breadcrumb";

const NAV_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Accounts", path: "/accounts" },
  { label: "Transactions", path: "/transactions" },
  { label: "Reports", path: "/reports" },
  { label: "Budgets", path: "/budgets" },
];

export function NavBar(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const [showNewTransaction, setShowNewTransaction] = useState(false);

  const activePath = "/" + location.pathname.split("/")[1];

  return (
    <>
      <nav className="navbar" data-testid="navbar">
        <span
          className="navbar-logo"
          data-testid="navbar-logo"
          onClick={() => navigate("/accounts")}
        >
          FINANCEWEB
        </span>

        <div className="navbar-links" data-testid="navbar-links">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              className={`navbar-link${activePath === link.path ? " navbar-link--active" : ""}`}
              data-testid={`navbar-link-${link.label.toLowerCase()}`}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="navbar-btn-new-transaction"
            data-testid="navbar-new-transaction-btn"
            onClick={() => setShowNewTransaction(true)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Transaction
          </button>

          <div className="navbar-user" data-testid="navbar-user">
            <div className="navbar-avatar" data-testid="navbar-avatar">
              {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("") : "U"}
            </div>
            <span className="navbar-user-name" data-testid="navbar-user-name">
              {user?.name ?? "John Doe"}
            </span>
          </div>

          <button
            className="navbar-logout-btn"
            data-testid="navbar-logout-btn"
            onClick={() => navigate("/login")}
          >
            Log Out
          </button>
        </div>
      </nav>

      <AccountingBreadcrumb />

      {showNewTransaction && (
        <NewTransactionModal onClose={() => setShowNewTransaction(false)} />
      )}
    </>
  );
}

function AccountingBreadcrumb(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split("/").filter(Boolean);
  const labels: Record<string, string> = {
    accounts: "Accounts",
    dashboard: "Dashboard",
    transactions: "Transactions",
    reports: "Reports",
    budgets: "Budgets",
  };

  const currentLabel = labels[segments[0]] ?? segments[0] ?? "Home";

  return (
    <Breadcrumb
      items={[
        { label: "Home", onClick: () => navigate("/") },
        { label: currentLabel },
      ]}
    />
  );
}
