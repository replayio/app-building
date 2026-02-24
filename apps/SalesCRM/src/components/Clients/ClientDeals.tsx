import { useNavigate } from 'react-router-dom'
import type { ClientDeal } from '../../store/slices/clientsSlice'
import { formatCurrency } from '../../lib/utils'

interface ClientDealsProps {
  deals: ClientDeal[]
}

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

const stageColors: Record<string, { color: string; bg: string }> = {
  lead: { color: 'var(--color-stage-lead)', bg: 'var(--color-stage-lead-bg)' },
  qualified: { color: 'var(--color-stage-qualified)', bg: 'var(--color-stage-qualified-bg)' },
  proposal: { color: 'var(--color-stage-proposal)', bg: 'var(--color-stage-proposal-bg)' },
  negotiation: { color: 'var(--color-stage-negotiation)', bg: 'var(--color-stage-negotiation-bg)' },
  closed_won: { color: 'var(--color-stage-closed-won)', bg: 'var(--color-stage-closed-won-bg)' },
  closed_lost: { color: 'var(--color-stage-closed-lost)', bg: 'var(--color-stage-closed-lost-bg)' },
}

export default function ClientDeals({ deals }: ClientDealsProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="client-deals" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)]">Deals</h2>
      </div>

      {deals.length === 0 ? (
        <div data-testid="client-deals-empty" className="rounded-lg border border-[var(--color-bg-border)] p-6 text-center">
          <p className="text-[13px] text-[var(--color-text-muted)]">No deals</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-bg-border)] divide-y divide-[var(--color-bg-border)]">
          {deals.map((deal) => {
            const style = stageColors[deal.stage] || stageColors.lead
            return (
              <button
                key={deal.id}
                data-testid={`deal-row-${deal.id}`}
                type="button"
                onClick={() => navigate(`/deals/${deal.id}`)}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-100 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-[var(--color-text-primary)]">{deal.name}</div>
                </div>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium shrink-0"
                  style={{ color: style.color, backgroundColor: style.bg }}
                >
                  {stageLabels[deal.stage] || deal.stage}
                </span>
                <span className="text-[13px] text-[var(--color-text-muted)] shrink-0">
                  {formatCurrency(deal.value)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
