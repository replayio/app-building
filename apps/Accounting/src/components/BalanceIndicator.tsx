import React from "react";
import { formatCurrency } from "@shared/utils/currency";

interface BalanceIndicatorProps {
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export function BalanceIndicator({
  totalDebits,
  totalCredits,
  isBalanced,
}: BalanceIndicatorProps): React.ReactElement {
  return (
    <div className="balance-indicator" data-testid="balance-indicator">
      <div className="balance-totals">
        <div className="balance-total-item">
          <span className="balance-total-label">Total Debits</span>
          <span className="balance-total-value" data-testid="total-debits">
            {formatCurrency(totalDebits)}
          </span>
        </div>
        <div className="balance-total-item">
          <span className="balance-total-label">Total Credits</span>
          <span className="balance-total-value" data-testid="total-credits">
            {formatCurrency(totalCredits)}
          </span>
        </div>
      </div>
      <div
        className={`balance-status ${isBalanced ? "balance-status--balanced" : "balance-status--unbalanced"}`}
        data-testid="balance-status"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          {isBalanced ? (
            <path
              d="M3 8L6.5 11.5L13 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M4 4L12 12M12 4L4 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
        </svg>
        {isBalanced ? "Transaction is Balanced" : "Transaction is Unbalanced"}
      </div>
    </div>
  );
}
