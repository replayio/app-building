import { useNavigate } from 'react-router-dom'
import type { Deal, DealStage } from '../../types'
import { DealStatusBadge } from './DealStatusBadge'

interface DealsPipelineViewProps {
  deals: Deal[]
}

const PIPELINE_STAGES: { key: DealStage; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: 'border-t-gray-400' },
  { key: 'qualification', label: 'Qualification', color: 'border-t-accent-blue' },
  { key: 'discovery', label: 'Discovery', color: 'border-t-accent-purple' },
  { key: 'proposal', label: 'Proposal', color: 'border-t-accent' },
  { key: 'negotiation', label: 'Negotiation', color: 'border-t-yellow-500' },
  { key: 'closed_won', label: 'Closed Won', color: 'border-t-status-active' },
]

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}k`
  }
  return `$${value.toLocaleString()}`
}

function DealCard({ deal }: { deal: Deal }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/deals/${deal.id}`)}
      className="p-3 bg-surface border border-border rounded-[6px] cursor-pointer hover:shadow-[var(--shadow-elevation-1)] transition-shadow duration-150"
    >
      <p className="text-[13px] font-medium text-text-primary mb-1 truncate">{deal.name}</p>
      <p className="text-[12px] text-text-muted mb-2 truncate">{deal.client_name}</p>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-primary">{formatCurrency(deal.value)}</span>
        <DealStatusBadge status={deal.status} />
      </div>
    </div>
  )
}

export function DealsPipelineView({ deals }: DealsPipelineViewProps) {
  const dealsByStage = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    deals: deals.filter((d) => d.stage === stage.key),
    totalValue: deals
      .filter((d) => d.stage === stage.key)
      .reduce((sum, d) => sum + Number(d.value), 0),
  }))

  return (
    <div className="grid grid-cols-6 gap-3 min-h-[400px]">
      {dealsByStage.map((column) => (
        <div key={column.key} className={`flex flex-col border-t-2 ${column.color} rounded-t-none`}>
          <div className="px-2 py-2 mb-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[13px] font-medium text-text-primary">{column.label}</span>
              <span className="text-[11px] text-text-muted bg-hover rounded-full px-1.5 py-0.5">
                {column.deals.length}
              </span>
            </div>
            <p className="text-[12px] text-text-muted">{formatCurrency(column.totalValue)}</p>
          </div>
          <div className="flex flex-col gap-2 px-1 pb-2 flex-1 overflow-y-auto">
            {column.deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
