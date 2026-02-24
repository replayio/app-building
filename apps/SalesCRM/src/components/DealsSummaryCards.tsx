import { TrendingUp, DollarSign, Trophy, AlertTriangle } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
  return `$${value.toFixed(0)}`
}

export default function DealsSummaryCards() {
  const summary = useAppSelector(s => s.deals.summary)
  const q = `Q${summary.currentQuarter}`

  return (
    <div className="deals-summary-cards" data-testid="deals-summary-cards">
      <div className="deals-summary-card" data-testid="summary-total-active">
        <div className="deals-summary-card-icon deals-summary-card-icon--active">
          <TrendingUp size={18} />
        </div>
        <div className="deals-summary-card-content">
          <span className="deals-summary-card-label">Total Active Deals:</span>
          <span className="deals-summary-card-value" data-testid="summary-total-active-value">
            {summary.totalActive}
          </span>
        </div>
      </div>

      <div className="deals-summary-card" data-testid="summary-pipeline-value">
        <div className="deals-summary-card-icon deals-summary-card-icon--pipeline">
          <DollarSign size={18} />
        </div>
        <div className="deals-summary-card-content">
          <span className="deals-summary-card-label">Pipeline Value:</span>
          <span className="deals-summary-card-value" data-testid="summary-pipeline-value-amount">
            {formatCurrency(summary.pipelineValue)}
          </span>
        </div>
      </div>

      <div className="deals-summary-card" data-testid="summary-won">
        <div className="deals-summary-card-icon deals-summary-card-icon--won">
          <Trophy size={18} />
        </div>
        <div className="deals-summary-card-content">
          <span className="deals-summary-card-label">Won ({q}):</span>
          <span className="deals-summary-card-value" data-testid="summary-won-value">
            {summary.wonCount} ({formatCurrency(summary.wonValue)})
          </span>
        </div>
      </div>

      <div className="deals-summary-card" data-testid="summary-lost">
        <div className="deals-summary-card-icon deals-summary-card-icon--lost">
          <AlertTriangle size={18} />
        </div>
        <div className="deals-summary-card-content">
          <span className="deals-summary-card-label">Lost ({q}):</span>
          <span className="deals-summary-card-value" data-testid="summary-lost-value">
            {summary.lostCount} ({formatCurrency(summary.lostValue)})
          </span>
        </div>
      </div>
    </div>
  )
}
