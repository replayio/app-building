import { useNavigate } from 'react-router-dom'
import type { Client } from '../../types'
import { StatusBadge } from './StatusBadge'
import { TagBadge } from './TagBadge'
import { ClientRowActionMenu } from './ClientRowActionMenu'

interface ClientsTableProps {
  clients: Client[]
  onDeleteClient: (clientId: string) => void
}

function formatDealsValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value}`
}

function formatNextTask(client: Client): string {
  if (client.status === 'churned') return 'N/A'
  if (!client.next_task_title) return 'No task scheduled'
  const dateStr = client.next_task_due
    ? ` - ${new Date(client.next_task_due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : ''
  return `${client.next_task_title}${dateStr}`
}

function formatPrimaryContact(client: Client): string {
  if (client.type === 'individual') {
    return `${client.name} (Self)`
  }
  if (!client.primary_contact_name) return '—'
  const role = client.primary_contact_role ? ` (${client.primary_contact_role})` : ''
  return `${client.primary_contact_name}${role}`
}

function formatOpenDeals(client: Client): string {
  if (client.status === 'churned') return '0'
  const count = Number(client.open_deals_count) || 0
  if (count === 0) return '0'
  const value = Number(client.open_deals_value) || 0
  return `${count} (Value: ${formatDealsValue(value)})`
}

const gridClass = 'clients-table-grid grid grid-cols-[1.2fr_0.8fr_0.7fr_1.2fr_1.1fr_0.9fr_1.3fr_40px]'

export function ClientsTable({ clients, onDeleteClient }: ClientsTableProps) {
  const navigate = useNavigate()

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-[13px]">
        No clients found.
      </div>
    )
  }

  return (
    <div data-testid="clients-table" className="w-full">
      {/* Header */}
      <div data-testid="clients-table-header" className={`clients-table-header ${gridClass} items-center h-[36px] px-4 text-[12px] font-medium text-text-muted border-b border-border`}>
        <span>Client Name</span>
        <span data-testid="clients-header-type" className="clients-col-type">Type</span>
        <span data-testid="clients-header-status" className="clients-col-status">Status</span>
        <span className="clients-col-tags">Tags</span>
        <span className="clients-col-contact">Primary Contact</span>
        <span className="clients-col-deals">Open Deals</span>
        <span className="clients-col-task">Next Task</span>
        <span></span>
      </div>

      {/* Rows */}
      {clients.map((client) => (
        <div
          key={client.id}
          data-testid={`client-row-${client.id}`}
          onClick={() => navigate(`/clients/${client.id}`)}
          className={`${gridClass} items-center h-[44px] px-4 cursor-pointer hover:bg-hover transition-colors duration-100 border-b border-border/50`}
        >
          <span data-testid="client-name" className="clients-col-name text-[13px] font-medium text-text-primary truncate pr-2">
            {client.name}
          </span>
          <span data-testid="client-type" className="clients-col-type text-[13px] text-text-secondary">
            {client.type === 'organization' ? 'Organization' : 'Individual'}
          </span>
          <span data-testid="client-status" className="clients-col-status">
            <StatusBadge status={client.status} />
          </span>
          <div data-testid="client-tags" className="clients-col-tags flex items-center gap-1 overflow-hidden">
            {client.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <span data-testid="client-primary-contact" className="clients-col-contact text-[13px] text-text-secondary truncate pr-2">
            {formatPrimaryContact(client)}
          </span>
          <span data-testid="client-open-deals" className="clients-col-deals text-[13px] text-text-secondary">
            {formatOpenDeals(client)}
          </span>
          <span data-testid="client-next-task" className="clients-col-task text-[13px] text-text-secondary truncate pr-2">
            {formatNextTask(client)}
          </span>
          <span className="clients-col-actions">
            <ClientRowActionMenu
              onView={() => navigate(`/clients/${client.id}`)}
              onEdit={() => navigate(`/clients/${client.id}`)}
              onDelete={() => onDeleteClient(client.id)}
            />
          </span>
        </div>
      ))}
    </div>
  )
}
