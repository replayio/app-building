import type { DealHistoryEntry } from "../dealDetailSlice";

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + ", " + date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface DealHistorySectionProps {
  history: DealHistoryEntry[];
}

export function DealHistorySection({ history }: DealHistorySectionProps) {
  return (
    <div className="detail-section" data-testid="deal-history-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">Deal History</h3>
      </div>
      <div className="detail-section-body">
        {history.length === 0 ? (
          <div className="detail-section-empty" data-testid="deal-history-empty">
            No stage changes yet
          </div>
        ) : (
          <div className="deal-history-list" data-testid="deal-history-list">
            {history.map((entry) => (
              <div key={entry.id} className="deal-history-entry" data-testid={`deal-history-entry-${entry.id}`}>
                <span className="deal-history-entry-text">
                  {formatDateTime(entry.changedAt)}: Changed Stage
                  {entry.oldStage ? ` from ${entry.oldStage}` : ""} to {entry.newStage} ({entry.changedBy})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
