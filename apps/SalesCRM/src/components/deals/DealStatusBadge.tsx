const STATUS_STYLES: Record<string, string> = {
  active: 'bg-accent/10 text-accent',
  on_track: 'bg-status-active/10 text-status-active',
  needs_attention: 'bg-yellow-500/10 text-yellow-600',
  at_risk: 'bg-status-churned/10 text-status-churned',
  won: 'bg-status-active/10 text-status-active',
  lost: 'bg-status-churned/10 text-status-churned',
  on_hold: 'bg-status-inactive/10 text-status-inactive',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  on_track: 'On Track',
  needs_attention: 'Needs Attention',
  at_risk: 'At Risk',
  won: 'Won',
  lost: 'Lost',
  on_hold: 'On Hold',
}

export function DealStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-status-inactive/10 text-status-inactive'
  const label = STATUS_LABELS[status] ?? status

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${style}`} data-testid={`deal-status-badge-${status}`}>
      {label}
    </span>
  )
}
