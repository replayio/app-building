import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { updateDealDetail } from "../dealDetailSlice";
import type { DealDetail } from "../dealDetailSlice";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface DealMetricsSectionProps {
  deal: DealDetail;
}

export function DealMetricsSection({ deal }: DealMetricsSectionProps) {
  const dispatch = useAppDispatch();

  const [editingProbability, setEditingProbability] = useState(false);
  const [probabilityInput, setProbabilityInput] = useState("");
  const [editingCloseDate, setEditingCloseDate] = useState(false);
  const [closeDateInput, setCloseDateInput] = useState("");

  const handleProbabilitySave = async () => {
    const parsed = parseInt(probabilityInput, 10);
    const newProb = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
    await dispatch(updateDealDetail({ dealId: deal.id, data: { probability: newProb } })).unwrap();
    setEditingProbability(false);
  };

  const handleProbabilityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleProbabilitySave();
    else if (e.key === "Escape") setEditingProbability(false);
  };

  const handleCloseDateSave = async () => {
    await dispatch(updateDealDetail({ dealId: deal.id, data: { expectedCloseDate: closeDateInput || undefined } })).unwrap();
    setEditingCloseDate(false);
  };

  const handleCloseDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCloseDateSave();
    else if (e.key === "Escape") setEditingCloseDate(false);
  };

  return (
    <div className="detail-section" data-testid="deal-metrics-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">Deal Metrics</h3>
      </div>
      <div className="detail-section-body">
        <div className="deal-metrics-grid">
          <div className="deal-metric" data-testid="deal-metric-probability">
            <span className="deal-metric-label">Probability:</span>
            {editingProbability ? (
              <input
                className="deal-metric-inline-input"
                data-testid="deal-metric-probability-input"
                type="number"
                min="0"
                max="100"
                value={probabilityInput}
                onChange={(e) => setProbabilityInput(e.target.value)}
                onBlur={handleProbabilitySave}
                onKeyDown={handleProbabilityKeyDown}
                autoFocus
              />
            ) : (
              <button
                className="deal-metric-value deal-metric-value--editable"
                data-testid="deal-metric-probability-value"
                onClick={() => {
                  setProbabilityInput(deal.probability != null ? String(deal.probability) : "");
                  setEditingProbability(true);
                }}
                type="button"
              >
                {deal.probability != null ? `${deal.probability}%` : "N/A"}
              </button>
            )}
          </div>
          <div className="deal-metric" data-testid="deal-metric-close-date">
            <span className="deal-metric-label">Expected Close:</span>
            {editingCloseDate ? (
              <input
                className="deal-metric-inline-input"
                data-testid="deal-metric-close-date-input"
                type="date"
                value={closeDateInput}
                onChange={(e) => setCloseDateInput(e.target.value)}
                onBlur={handleCloseDateSave}
                onKeyDown={handleCloseDateKeyDown}
                autoFocus
              />
            ) : (
              <button
                className="deal-metric-value deal-metric-value--editable"
                data-testid="deal-metric-close-date-value"
                onClick={() => {
                  setCloseDateInput(deal.expectedCloseDate || "");
                  setEditingCloseDate(true);
                }}
                type="button"
              >
                {formatDate(deal.expectedCloseDate)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
