import type { Transaction } from "../types";

interface BasicInfoSectionProps {
  transaction: Transaction;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

function formatTransactionType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function BasicInfoSection({ transaction }: BasicInfoSectionProps) {
  return (
    <div data-testid="basic-info-section">
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            <svg
              className="section-card-title-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Basic Info
          </h2>
        </div>
        <div className="section-card-body">
          <div
            data-testid="basic-info-fields"
            className="grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4"
          >
            <div data-testid="basic-info-date">
              <span className="form-label">Date</span>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-primary)",
                  padding: "8px 10px",
                  background: "var(--bg-sidebar-color)",
                  borderRadius: 4,
                  border: "1px solid var(--bg-border-color-light)",
                }}
              >
                {formatDate(transaction.date)}
              </div>
            </div>

            <div data-testid="basic-info-reference-id">
              <span className="form-label">Reference Id</span>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-primary)",
                  padding: "8px 10px",
                  background: "var(--bg-sidebar-color)",
                  borderRadius: 4,
                  border: "1px solid var(--bg-border-color-light)",
                }}
              >
                {transaction.reference_id || "—"}
              </div>
            </div>

            <div data-testid="basic-info-description">
              <span className="form-label">Description</span>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-primary)",
                  padding: "8px 10px",
                  background: "var(--bg-sidebar-color)",
                  borderRadius: 4,
                  border: "1px solid var(--bg-border-color-light)",
                  minHeight: 60,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {transaction.description || "—"}
              </div>
            </div>

            <div data-testid="basic-info-transaction-type">
              <span className="form-label">Transaction Type</span>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-primary)",
                  padding: "8px 10px",
                  background: "var(--bg-sidebar-color)",
                  borderRadius: 4,
                  border: "1px solid var(--bg-border-color-light)",
                }}
              >
                {formatTransactionType(transaction.transaction_type)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
