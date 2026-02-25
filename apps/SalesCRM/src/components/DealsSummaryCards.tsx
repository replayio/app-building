import { useMemo } from "react";
import type { Deal } from "../dealsSlice";

interface DealsSummaryCardsProps {
  deals: Deal[];
}

function formatCompactValue(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}k`;
  }
  return `$${value.toFixed(0)}`;
}

export function DealsSummaryCards({ deals }: DealsSummaryCardsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const q3Start = new Date(now.getFullYear(), 6, 1); // July 1
    const q3End = new Date(now.getFullYear(), 9, 0, 23, 59, 59); // Sep 30

    let activeCount = 0;
    let pipelineValue = 0;
    let wonCount = 0;
    let wonValue = 0;
    let lostCount = 0;
    let lostValue = 0;

    for (const deal of deals) {
      if (deal.status === "active" || deal.status === "On Track" || deal.status === "Needs Attention" || deal.status === "At Risk") {
        activeCount++;
        pipelineValue += deal.value || 0;
      }

      const dealDate = deal.updatedAt ? new Date(deal.updatedAt) : new Date(deal.createdAt);

      if (deal.stage === "Closed Won" || deal.status === "Won") {
        if (dealDate >= q3Start && dealDate <= q3End) {
          wonCount++;
          wonValue += deal.value || 0;
        }
      }

      if (deal.stage === "Closed Lost" || deal.status === "Lost") {
        if (dealDate >= q3Start && dealDate <= q3End) {
          lostCount++;
          lostValue += deal.value || 0;
        }
      }
    }

    return { activeCount, pipelineValue, wonCount, wonValue, lostCount, lostValue };
  }, [deals]);

  return (
    <div className="deals-summary-cards" data-testid="deals-summary-cards">
      <div className="deals-summary-card" data-testid="summary-total-active">
        <div className="deals-summary-card-icon deals-summary-card-icon--active">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 7h8M5 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="deals-summary-card-content">
          <span className="deals-summary-card-label">Total Active Deals:</span>
          <span className="deals-summary-card-value" data-testid="summary-active-count">{stats.activeCount}</span>
        </div>
      </div>

      <div className="deals-summary-card" data-testid="summary-pipeline-value">
        <div className="deals-summary-card-icon deals-summary-card-icon--pipeline">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2 7h14" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6 4V2M12 4V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="deals-summary-card-content">
          <span className="deals-summary-card-label">Pipeline Value:</span>
          <span className="deals-summary-card-value" data-testid="summary-pipeline-amount">{formatCompactValue(stats.pipelineValue)}</span>
        </div>
      </div>

      <div className="deals-summary-card" data-testid="summary-won-q3">
        <div className="deals-summary-card-icon deals-summary-card-icon--won">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="deals-summary-card-content">
          <span className="deals-summary-card-label">Won (Q3):</span>
          <span className="deals-summary-card-value" data-testid="summary-won-count">
            {stats.wonCount} ({formatCompactValue(stats.wonValue)})
          </span>
        </div>
      </div>

      <div className="deals-summary-card" data-testid="summary-lost-q3">
        <div className="deals-summary-card-icon deals-summary-card-icon--lost">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6.5 6.5l5 5M11.5 6.5l-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="deals-summary-card-content">
          <span className="deals-summary-card-label">Lost (Q3):</span>
          <span className="deals-summary-card-value" data-testid="summary-lost-count">
            {stats.lostCount} ({formatCompactValue(stats.lostValue)})
          </span>
        </div>
      </div>
    </div>
  );
}
