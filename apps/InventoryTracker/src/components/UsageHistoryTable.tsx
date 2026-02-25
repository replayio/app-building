import { useNavigate } from "react-router-dom";
import type { BatchUsageEntry } from "../types";

interface UsageHistoryTableProps {
  entries: BatchUsageEntry[];
  unit: string;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}, ${hours}:${minutes}`;
}

function typeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}

export function UsageHistoryTable({ entries, unit }: UsageHistoryTableProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="usage-history-table">
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
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Usage History
          </h2>
        </div>
        <div className="section-card-body">
          {entries.length === 0 ? (
            <div data-testid="usage-history-empty" className="empty-state">
              <div className="empty-state-message">
                No usage history for this batch
              </div>
            </div>
          ) : (
            <table className="data-table" data-testid="usage-history-data-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Movement</th>
                  <th>Amount ({unit})</th>
                  <th>Created Batches</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={`${entry.transaction_id}-${entry.movement}`}
                    data-testid={`usage-row-${entry.reference_id || entry.transaction_id}`}
                  >
                    <td>{formatDateTime(entry.created_at)}</td>
                    <td>
                      <a
                        className="link"
                        data-testid={`usage-txn-link-${entry.reference_id || entry.transaction_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/transactions/${entry.transaction_id}`);
                        }}
                        href={`/transactions/${entry.transaction_id}`}
                      >
                        {entry.reference_id || entry.transaction_id.substring(0, 13)}
                      </a>
                    </td>
                    <td>{typeLabel(entry.transaction_type)}</td>
                    <td>
                      <span
                        data-testid={`usage-movement-${entry.reference_id || entry.transaction_id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          color:
                            entry.movement === "in"
                              ? "var(--accent-primary)"
                              : "var(--status-error)",
                        }}
                      >
                        {entry.movement === "in" ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ width: 12, height: 12 }}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ width: 12, height: 12 }}
                          >
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        )}
                        {entry.movement === "in" ? "In" : "Out"}
                      </span>
                    </td>
                    <td>
                      {Number(entry.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {entry.created_batches.length === 0 ? (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      ) : (
                        <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {entry.created_batches.map((cb, idx) => (
                            <span key={cb.batch_id}>
                              <a
                                className="link"
                                data-testid={`usage-created-batch-${cb.batch_id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/batches/${cb.batch_id}`);
                                }}
                                href={`/batches/${cb.batch_id}`}
                              >
                                {cb.reference || cb.batch_id.substring(0, 13)}
                              </a>
                              {idx < entry.created_batches.length - 1 && ", "}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
