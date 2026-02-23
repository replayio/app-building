import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'

interface UserDeal {
  id: string
  name: string
  client_name: string
  value: number
  stage: string
  status: string
}

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualification: 'Qualification',
  discovery: 'Discovery',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

interface UserDealsSectionProps {
  deals: UserDeal[]
}

export function UserDealsSection({ deals }: UserDealsSectionProps) {
  return (
    <div data-testid="user-deals-section" className="border border-border rounded-[6px] bg-surface">
      <div className="px-5 max-sm:px-3 py-4 max-sm:py-3 border-b border-border flex items-center gap-2">
        <Briefcase size={14} strokeWidth={1.75} className="text-text-muted" />
        <h2 className="text-[14px] font-semibold text-text-primary">Deals ({deals.length})</h2>
      </div>
      <div className="px-5 max-sm:px-3 py-4 max-sm:py-3">
        {deals.length === 0 ? (
          <p className="text-[13px] text-text-muted text-center py-4">No deals owned by this user.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}`}
                data-testid={`user-deal-${deal.id}`}
                className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-1 py-2 px-3 rounded-[5px] hover:bg-hover transition-colors duration-100"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-text-primary">{deal.name}</div>
                  <div className="text-[12px] text-text-muted">{deal.client_name}</div>
                </div>
                <div className="flex items-center gap-3 text-[12px] max-sm:ml-0">
                  <span className="text-text-secondary">${Number(deal.value).toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded-[3px] bg-hover text-text-secondary border border-border">
                    {stageLabels[deal.stage] ?? deal.stage}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
