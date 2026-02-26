import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import type { Account } from "../types";

interface AccountHeaderProps {
  account: Account;
  onEditAccount: () => void;
}

function typeLabel(accountType: string): string {
  switch (accountType) {
    case "stock":
      return "Stock";
    case "input":
      return "Input";
    case "output":
      return "Output";
    default:
      return accountType.charAt(0).toUpperCase() + accountType.slice(1);
  }
}

export function AccountHeader({ account, onEditAccount }: AccountHeaderProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="account-header">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: "Accounts", onClick: () => navigate("/accounts") },
          { label: account.name },
        ]}
      />

      <div className="page-header" style={{ marginTop: 16 }}>
        <div>
          <h1 data-testid="account-name" className="page-title">
            Account: {account.name}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 8,
            }}
          >
            <span
              data-testid="account-type"
              style={{ fontSize: 13, color: "var(--text-muted)" }}
            >
              Type: {typeLabel(account.account_type)}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              Status:{" "}
              <span
                data-testid="account-status-badge"
                className={`badge badge--${account.status}`}
              >
                {account.status === "active" ? "Active" : "Archived"}
              </span>
            </span>
          </div>
        </div>
        <div className="page-header-actions">
          <button
            data-testid="edit-account-btn"
            className="btn-secondary"
            onClick={onEditAccount}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 14, height: 14 }}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="max-sm:hidden">Edit Account</span>
          </button>
          <button
            data-testid="new-transaction-btn"
            className="btn-primary"
            onClick={() =>
              navigate(`/transactions/new?account_id=${account.id}`)
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 14, height: 14 }}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="max-sm:hidden">New Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
}
