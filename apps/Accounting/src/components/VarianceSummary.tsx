import React from "react";
import type { ReportItem } from "../types";
import { formatCurrency } from "../../../shared/utils/currency";

interface VarianceSummaryProps {
  items: ReportItem[];
}

function Sparkline({ values }: { values: number[] }): React.ReactElement {
  if (values.length === 0) {
    return <svg width="100" height="32" />;
  }
  const w = 100;
  const h = 32;
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const trend = values[values.length - 1] >= values[0];
  const color = trend ? "var(--status-success)" : "var(--status-error)";

  return (
    <svg width={w} height={h} data-testid="variance-sparkline">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VarianceSummary({
  items,
}: VarianceSummaryProps): React.ReactElement {
  const accountItems = items.filter((i) => i.item_type === "account");

  const totalActual = accountItems.reduce(
    (sum, i) => sum + i.actual_amount,
    0
  );
  const totalBudget = accountItems.reduce(
    (sum, i) => sum + i.budget_amount,
    0
  );
  const totalVariance = totalBudget - totalActual;
  const totalVariancePct =
    totalBudget !== 0
      ? Math.round((Math.abs(totalVariance) / totalBudget) * 1000) / 10
      : 0;

  const isNegative = totalVariance < 0;
  const isPositive = totalVariance > 0;

  const varianceLabel = isNegative
    ? `-${formatCurrency(Math.abs(totalVariance))} (${totalVariancePct}%)`
    : isPositive
      ? `+${formatCurrency(totalVariance)} (${totalVariancePct}%)`
      : `${formatCurrency(0)} (0%)`;

  // Generate sparkline data from account variances
  const sparkData = accountItems.map((i) => i.variance);

  return (
    <div className="variance-summary-card" data-testid="variance-summary">
      <div className="variance-summary-metric" data-testid="total-variance">
        <span className="variance-summary-label">Total Variance:</span>
        <span
          className={`variance-summary-value ${
            isNegative
              ? "variance-summary-value--negative"
              : isPositive
                ? "variance-summary-value--positive"
                : ""
          }`}
        >
          {varianceLabel}
          {isNegative && (
            <span className="variance-arrow" data-testid="variance-arrow-down">
              {" "}
              ↓
            </span>
          )}
          {isPositive && (
            <span className="variance-arrow" data-testid="variance-arrow-up">
              {" "}
              ↑
            </span>
          )}
        </span>
      </div>

      <div className="variance-summary-metric" data-testid="actual-spend">
        <span className="variance-summary-label">Actual Spend:</span>
        <span className="variance-summary-amount">
          {formatCurrency(totalActual)}
        </span>
      </div>

      <div className="variance-summary-metric" data-testid="budgeted-spend">
        <span className="variance-summary-label">Budgeted Spend:</span>
        <span className="variance-summary-amount">
          {formatCurrency(totalBudget)}
        </span>
      </div>

      <div
        className="variance-summary-chart"
        data-testid="variance-trend-chart"
      >
        <Sparkline values={sparkData} />
      </div>
    </div>
  );
}
