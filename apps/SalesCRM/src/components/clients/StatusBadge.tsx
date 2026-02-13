import type { ClientStatus } from '../../types'

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-status-active/15 text-status-active' },
  inactive: { label: 'Inactive', className: 'bg-status-inactive/15 text-status-inactive' },
  prospect: { label: 'Prospect', className: 'bg-status-prospect/15 text-status-prospect' },
  churned: { label: 'Churned', className: 'bg-status-churned/15 text-status-churned' },
}

interface StatusBadgeProps {
  status: ClientStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
