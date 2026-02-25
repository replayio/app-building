import React from "react";
import { formatCurrency } from "@shared/utils/currency";
import type { Budget } from "../types";

interface BudgetDetailsTabProps {
  budgets: Budget[];
}

export function BudgetDetailsTab({
  budgets,
}: BudgetDetailsTabProps): React.ReactElement {
  if (budgets.length === 0) {
    return (
      <div className="budget-details-empty" data-testid="budget-details-empty">
        No budget items found for this account.
      </div>
    );
  }

  return (
    <div className="budget-details-list" data-testid="budget-details-list">
      {budgets.map((budget) => {
        const pct =
          budget.amount > 0
            ? (budget.actual_amount / budget.amount) * 100
            : 0;
        const pctClamped = Math.min(pct, 100);
        const isOver = pct > 100;
        const isWarning = pct >= 80 && pct < 100;

        let barClass = "budget-detail-bar-fill";
        if (isOver) barClass += " budget-detail-bar-fill--over";
        else if (isWarning) barClass += " budget-detail-bar-fill--warning";

        return (
          <div
            key={budget.id}
            className="budget-detail-item"
            data-testid={`budget-detail-item-${budget.id}`}
          >
            <div className="budget-detail-header">
              <span
                className="budget-detail-name"
                data-testid={`budget-detail-name-${budget.id}`}
              >
                {budget.name}
              </span>
              <span
                className="budget-detail-amounts"
                data-testid={`budget-detail-amounts-${budget.id}`}
              >
                {formatCurrency(budget.actual_amount)} /{" "}
                {formatCurrency(budget.amount)}
              </span>
            </div>
            <div className="budget-detail-bar-track">
              <div
                className={barClass}
                style={{ width: `${pctClamped}%` }}
                data-testid={`budget-detail-bar-${budget.id}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
