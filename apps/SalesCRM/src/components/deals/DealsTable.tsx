import { useNavigate } from 'react-router-dom'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import type { Deal } from '../../types'
import { DealStageBadge } from './DealStageBadge'
import { DealStatusBadge } from './DealStatusBadge'
import { DealRowActionMenu } from './DealRowActionMenu'

interface DealsTableProps {
  deals: Deal[]
  sort: string
  onSortChange: (sort: string) => void
  onDeleteDeal: (dealId: string) => void
}

function formatCurrency(value: number): string {
  return `$${Number(value).toLocaleString()}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function DealsTable({ deals, sort, onSortChange, onDeleteDeal }: DealsTableProps) {
  const navigate = useNavigate()

  function handleCloseDateSort() {
    if (sort === 'close_date_desc') {
      onSortChange('close_date_asc')
    } else {
      onSortChange('close_date_desc')
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full deals-table" data-testid="deals-table">
        <thead className="deals-table-head">
          <tr className="border-b border-border">
            <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">Deal Name</th>
            <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted max-md:hidden">Client</th>
            <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">Stage</th>
            <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted max-lg:hidden">Owner</th>
            <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">Value</th>
            <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted max-lg:hidden">
              <button
                data-testid="deals-close-date-sort"
                data-sort-direction={sort === 'close_date_asc' ? 'asc' : sort === 'close_date_desc' ? 'desc' : undefined}
                onClick={handleCloseDateSort}
                className="inline-flex items-center gap-1 hover:text-text-primary transition-colors duration-100"
              >
                Close Date
                {sort === 'close_date_asc' ? (
                  <ArrowUp size={12} strokeWidth={2} />
                ) : sort === 'close_date_desc' ? (
                  <ArrowDown size={12} strokeWidth={2} />
                ) : (
                  <ArrowUpDown size={12} strokeWidth={2} />
                )}
              </button>
            </th>
            <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted max-md:hidden">Status</th>
            <th className="w-[44px]" />
          </tr>
        </thead>
        <tbody>
          {deals.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-[13px] text-text-muted">
                No deals found
              </td>
            </tr>
          ) : (
            deals.map((deal) => (
              <tr
                key={deal.id}
                data-testid={`deal-row-${deal.id}`}
                onClick={() => navigate(`/deals/${deal.id}`)}
                className="border-b border-border last:border-b-0 cursor-pointer hover:bg-hover transition-colors duration-100"
              >
                <td className="deals-col-name px-4 py-3 text-[13px] font-medium text-text-primary" data-testid={`deal-name-${deal.id}`}>{deal.name}</td>
                <td className="px-4 py-3 text-[13px] text-text-secondary max-md:hidden" data-testid={`deal-client-${deal.id}`}>{deal.client_name}</td>
                <td className="deals-col-stage px-4 py-3" data-testid={`deal-stage-${deal.id}`}>
                  <DealStageBadge stage={deal.stage} />
                </td>
                <td className="px-4 py-3 text-[13px] text-text-secondary max-lg:hidden" data-testid={`deal-owner-${deal.id}`}>{deal.owner || '—'}</td>
                <td className="deals-col-value px-4 py-3 text-[13px] text-text-primary font-medium" data-testid={`deal-value-${deal.id}`}>{formatCurrency(deal.value)}</td>
                <td className="px-4 py-3 text-[13px] text-text-secondary max-lg:hidden" data-testid={`deal-close-date-${deal.id}`}>{formatDate(deal.expected_close_date)}</td>
                <td className="px-4 py-3 max-md:hidden" data-testid={`deal-status-${deal.id}`}>
                  <DealStatusBadge status={deal.status} />
                </td>
                <td className="deals-col-actions px-4 py-3">
                  <DealRowActionMenu dealId={deal.id} onDelete={onDeleteDeal} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
