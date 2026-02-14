import type { DealStage } from '../../types'

const STAGE_LABELS: Record<DealStage, string> = {
  lead: 'Lead',
  qualification: 'Qualification',
  discovery: 'Discovery',
  proposal: 'Proposal Sent',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

const STAGE_STYLES: Record<DealStage, string> = {
  lead: 'bg-gray-100 text-text-muted',
  qualification: 'bg-accent-blue/10 text-accent-blue',
  discovery: 'bg-accent-purple/10 text-accent-purple',
  proposal: 'bg-accent/10 text-accent',
  negotiation: 'bg-yellow-500/10 text-yellow-600',
  closed_won: 'bg-status-active/10 text-status-active',
  closed_lost: 'bg-status-churned/10 text-status-churned',
}

export function DealStageBadge({ stage }: { stage: DealStage }) {
  const label = STAGE_LABELS[stage] ?? stage
  const style = STAGE_STYLES[stage] ?? 'bg-gray-100 text-text-muted'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${style}`}>
      {label}
    </span>
  )
}
