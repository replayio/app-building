import { useNavigate } from "react-router-dom";
import type { QuantityTransfer } from "../types";

interface QuantityTransfersTableProps {
  transfers: QuantityTransfer[];
}

function formatAmount(value: number): string {
  const num = Number(value);
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}`;
}

function DownArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 14, height: 14, color: "var(--status-error)", flexShrink: 0 }}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function UpArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 14, height: 14, color: "var(--accent-primary)", flexShrink: 0 }}
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16 }}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function QuantityTransfersTable({ transfers }: QuantityTransfersTableProps) {
  const navigate = useNavigate();

  // Compute totals
  // For each transfer: source display = -amount, destination display = +amount
  // Debits = sum of absolute values of all negative displayed amounts
  // Credits = sum of all positive displayed amounts
  let totalDebits = 0;
  let totalCredits = 0;

  for (const t of transfers) {
    const amt = Number(t.amount);
    const srcAmt = -amt;
    const destAmt = amt;

    if (srcAmt < 0) totalDebits += Math.abs(srcAmt);
    else totalCredits += srcAmt;

    if (destAmt < 0) totalDebits += Math.abs(destAmt);
    else totalCredits += destAmt;
  }

  const isBalanced = totalDebits === totalCredits;

  return (
    <div data-testid="quantity-transfers-section">
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
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            Quantity Transfers (Double-Entry View)
          </h2>
          <div
            data-testid="balance-indicator"
            className={`balance-indicator ${isBalanced ? "balance-indicator--balanced" : "balance-indicator--unbalanced"}`}
          >
            {isBalanced ? <CheckIcon /> : <XIcon />}
            <span>{isBalanced ? "Balanced" : "Unbalanced"}</span>
          </div>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          {transfers.length === 0 ? (
            <div data-testid="quantity-transfers-empty" className="empty-state">
              <p className="empty-state-message">
                No quantity transfers for this transaction
              </p>
            </div>
          ) : (
            <>
              <table className="data-table" data-testid="quantity-transfers-table">
                <thead>
                  <tr>
                    <th>Source Account</th>
                    <th className="max-md:hidden">Source Amount</th>
                    <th className="max-lg:hidden">Source Batch ID (Optional)</th>
                    <th>Destination Account</th>
                    <th className="max-md:hidden">Destination Amount</th>
                    <th>Net Transfer</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => {
                    const amt = Number(transfer.amount);
                    const srcAmt = -amt;
                    const destAmt = amt;
                    const netTransfer = Math.abs(amt);

                    return (
                      <tr
                        key={transfer.id}
                        data-testid={`transfer-row-${transfer.id}`}
                      >
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {srcAmt < 0 ? <DownArrow /> : <UpArrow />}
                            <a
                              className="link"
                              data-testid={`source-account-link-${transfer.id}`}
                              href={`/accounts/${transfer.source_account_id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/accounts/${transfer.source_account_id}`);
                              }}
                            >
                              {transfer.source_account_name || transfer.source_account_id}
                            </a>
                          </div>
                        </td>
                        <td className="max-md:hidden">
                          <span data-testid={`source-amount-${transfer.id}`}>
                            {formatAmount(srcAmt)} {transfer.unit}
                          </span>
                        </td>
                        <td className="max-lg:hidden">
                          {transfer.source_batch_id ? (
                            <a
                              className="link"
                              data-testid={`source-batch-link-${transfer.id}`}
                              href={`/batches/${transfer.source_batch_id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/batches/${transfer.source_batch_id}`);
                              }}
                            >
                              {transfer.source_batch_label || transfer.source_batch_id}
                            </a>
                          ) : (
                            <span
                              data-testid={`source-batch-na-${transfer.id}`}
                              style={{ color: "var(--text-muted)" }}
                            >
                              N/A
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {destAmt < 0 ? <DownArrow /> : <UpArrow />}
                            <a
                              className="link"
                              data-testid={`dest-account-link-${transfer.id}`}
                              href={`/accounts/${transfer.destination_account_id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/accounts/${transfer.destination_account_id}`);
                              }}
                            >
                              {transfer.destination_account_name || transfer.destination_account_id}
                            </a>
                          </div>
                        </td>
                        <td className="max-md:hidden">
                          <span data-testid={`dest-amount-${transfer.id}`}>
                            {formatAmount(destAmt)} {transfer.unit}
                          </span>
                        </td>
                        <td>
                          <span data-testid={`net-transfer-${transfer.id}`}>
                            {netTransfer.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div
                data-testid="transfers-totals"
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid var(--bg-border-color-light)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 16,
                }}
              >
                <span>Total Debits: {totalDebits.toFixed(2)}</span>
                <span>|</span>
                <span>Total Credits: {totalCredits.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
