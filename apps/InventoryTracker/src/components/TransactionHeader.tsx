import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import type { Transaction } from "../types";

interface TransactionHeaderProps {
  transaction: Transaction;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "posted":
      return "Completed";
    case "draft":
      return "Pending";
    case "void":
      return "Voided";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "posted":
      return "badge badge--posted";
    case "draft":
      return "badge badge--draft";
    case "void":
      return "badge badge--void";
    default:
      return "badge badge--default";
  }
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function TransactionHeader({ transaction }: TransactionHeaderProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="transaction-header">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: "Transactions", onClick: () => navigate("/transactions") },
          { label: transaction.id },
        ]}
      />

      <div className="page-header" style={{ marginTop: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h1 data-testid="transaction-id-heading" className="page-title" style={{ wordBreak: "break-all" }}>
              Transaction ID: {transaction.id}
            </h1>
            <span
              data-testid="transaction-status-badge"
              className={getStatusBadgeClass(transaction.status)}
            >
              {getStatusLabel(transaction.status)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <div data-testid="transaction-datetime">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                }}
              >
                Date/Time:
              </span>{" "}
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
                {formatDateTime(transaction.created_at)}
              </span>
            </div>

            <div data-testid="transaction-creator">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                }}
              >
                Creator:
              </span>{" "}
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
                {transaction.created_by || "—"}
              </span>
            </div>
          </div>

          {transaction.description && (
            <div
              data-testid="transaction-description"
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginTop: 8,
                maxWidth: 600,
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                }}
              >
                Description:
              </span>{" "}
              {transaction.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
