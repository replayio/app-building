import { useNavigate } from 'react-router-dom'
import { ArrowUpDown } from 'lucide-react'
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
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">Deal Name</th>
          <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">Client</th>
          <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">Stage</th>
          <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">Owner</th>
          <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">Value</th>
          <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">
            <button
              onClick={handleCloseDateSort}
              className="inline-flex items-center gap-1 hover:text-text-primary transition-colors duration-100"
            >
              Close Date
              <ArrowUpDown size={12} strokeWidth={2} />
            </button>
          </th>
          <th className="text-left px-4 py-2.5 text-[12px] font-medium text-text-muted">Status</th>
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
              onClick={() => navigate(`/deals/${deal.id}`)}
              className="border-b border-border last:border-b-0 cursor-pointer hover:bg-hover transition-colors duration-100"
            >
              <td className="px-4 py-3 text-[13px] font-medium text-text-primary">{deal.name}</td>
              <td className="px-4 py-3 text-[13px] text-text-secondary">{deal.client_name}</td>
              <td className="px-4 py-3">
                <DealStageBadge stage={deal.stage} />
              </td>
              <td className="px-4 py-3 text-[13px] text-text-secondary">{deal.owner || '—'}</td>
              <td className="px-4 py-3 text-[13px] text-text-primary font-medium">{formatCurrency(deal.value)}</td>
              <td className="px-4 py-3 text-[13px] text-text-secondary">{formatDate(deal.expected_close_date)}</td>
              <td className="px-4 py-3">
                <DealStatusBadge status={deal.status} />
              </td>
              <td className="px-4 py-3">
                <DealRowActionMenu dealId={deal.id} onDelete={onDeleteDeal} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
