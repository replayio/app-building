import { useNavigate } from 'react-router-dom'
import type { Deal, DealStage } from '../../types'

interface DealsSectionProps {
  deals: Deal[]
}

const stageLabels: Record<DealStage, string> = {
  lead: 'Lead',
  qualification: 'Qualification',
  discovery: 'Discovery',
  proposal: 'Proposal Sent',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

function formatValue(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
  return `$${value.toLocaleString()}`
}

export function DealsSection({ deals }: DealsSectionProps) {
  const navigate = useNavigate()

  return (
    <div className="border border-border rounded-[6px] p-4 mb-4">
      <h2 className="text-[14px] font-semibold text-text-primary mb-3">Deals</h2>

      {deals.length === 0 ? (
        <div className="text-[13px] text-text-muted py-2">No deals</div>
      ) : (
        <div className="flex flex-col gap-1">
          {deals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => navigate(`/deals/${deal.id}`)}
              className="flex items-center justify-between px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100 cursor-pointer"
            >
              <div className="text-[13px] text-text-primary">
                {deal.name}
                <span className="text-text-muted ml-2">
                  - Stage: {stageLabels[deal.stage]}, Value: {formatValue(Number(deal.value))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
