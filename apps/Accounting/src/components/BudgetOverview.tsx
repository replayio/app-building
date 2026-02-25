import React from "react";
import { formatCurrency } from "@shared/utils/currency";

interface BudgetOverviewProps {
  budgetAmount: number;
  budgetActual: number;
}

export function BudgetOverview({
  budgetAmount,
  budgetActual,
}: BudgetOverviewProps): React.ReactElement {
  const pct = budgetAmount > 0 ? (budgetActual / budgetAmount) * 100 : 0;
  const pctClamped = Math.min(pct, 100);
  const isWarning = pct >= 80 && pct < 100;
  const isOver = pct >= 100;

  let barClass = "budget-overview-bar-fill";
  if (isOver) barClass += " budget-overview-bar-fill--over";
  else if (isWarning) barClass += " budget-overview-bar-fill--warning";

  return (
    <div className="budget-overview" data-testid="budget-overview">
      <div className="budget-overview-header">
        <h2
          className="budget-overview-title"
          data-testid="budget-overview-title"
        >
          Budget Overview
        </h2>
        <span
          className="budget-overview-pct"
          data-testid="budget-overview-pct"
        >
          {Math.round(pct)}% used
        </span>
      </div>

      <div className="budget-overview-bar-track" data-testid="budget-overview-bar">
        <div
          className={barClass}
          style={{ width: `${pctClamped}%` }}
        />
      </div>

      <div
        className="budget-overview-amounts"
        data-testid="budget-overview-amounts"
      >
        Actual: {formatCurrency(budgetActual)} / Budgeted:{" "}
        {formatCurrency(budgetAmount)}
      </div>
    </div>
  );
}
