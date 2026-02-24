import { useNavigate } from 'react-router-dom'
import type { UserDeal } from '../../store/slices/usersSlice'
import { formatCurrency } from '../../lib/utils'

interface UserDealsListProps {
  deals: UserDeal[]
}

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

export default function UserDealsList({ deals }: UserDealsListProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="user-deals-section" className="mb-6">
      <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-3">Owned Deals</h2>
      {deals.length === 0 ? (
        <p data-testid="user-deals-empty" className="text-[13px] text-[var(--color-text-muted)] py-4">
          No owned deals yet
        </p>
      ) : (
        <div className="border border-[var(--color-bg-border)] rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-bg-border)] bg-[var(--color-bg-sidebar)]">
                <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Deal</th>
                <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Client</th>
                <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Value</th>
                <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Stage</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr
                  key={deal.id}
                  data-testid={`user-deal-${deal.id}`}
                  onClick={() => navigate(`/deals/${deal.id}`)}
                  className="border-b border-[var(--color-bg-border)] last:border-b-0 hover:bg-[var(--color-hover)] cursor-pointer"
                >
                  <td className="px-3 py-2 text-[var(--color-text-primary)] font-medium">{deal.name}</td>
                  <td className="px-3 py-2 text-[var(--color-text-muted)]">{deal.client_name || '—'}</td>
                  <td className="px-3 py-2 text-[var(--color-text-primary)]">{formatCurrency(deal.value)}</td>
                  <td className="px-3 py-2">
                    <span className="inline-block px-2 py-0.5 rounded text-[12px] bg-[var(--color-status-prospect-bg)] text-[var(--color-status-prospect)]">
                      {stageLabels[deal.stage] || deal.stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
