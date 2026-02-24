import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import type { Client } from '../../store/slices/clientsSlice'

interface ClientsTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'var(--color-status-active)', bg: 'var(--color-status-active-bg)' },
  inactive: { label: 'Inactive', color: 'var(--color-status-inactive)', bg: 'var(--color-status-inactive-bg)' },
  prospect: { label: 'Prospect', color: 'var(--color-status-prospect)', bg: 'var(--color-status-prospect-bg)' },
  churned: { label: 'Churned', color: 'var(--color-status-churned)', bg: 'var(--color-status-churned-bg)' },
}

function formatDealValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  if (value > 0) return `$${value.toFixed(0)}`
  return ''
}

function formatNextTask(task: string | null, due: string | null): string {
  if (!task) return 'No task scheduled'
  if (!due) return task

  const now = new Date()
  const dueDate = new Date(due)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeekEnd = new Date(today)
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7)

  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

  if (dueDay.getTime() === today.getTime()) {
    const hours = dueDate.getHours()
    const minutes = dueDate.getMinutes()
    if (hours || minutes) {
      const period = hours >= 12 ? 'pm' : 'am'
      const h = hours % 12 || 12
      const timeStr = minutes ? `${h}:${String(minutes).padStart(2, '0')}${period}` : `${h}${period}`
      return `${task} - Today, ${timeStr}`
    }
    return `${task} - Today`
  }
  if (dueDay.getTime() === tomorrow.getTime()) {
    return `${task} - Tomorrow`
  }
  if (dueDay > today && dueDay <= nextWeekEnd) {
    return `${task} - Next Week`
  }

  return `${task} - ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function ActionMenu({ client, onEdit, onDelete }: { client: Client; onEdit: (c: Client) => void; onDelete: (c: Client) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-testid="action-menu-trigger"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer"
      >
        <MoreHorizontal size={16} className="text-[var(--color-text-muted)]" />
      </button>
      {open && (
        <div
          data-testid="action-menu-dropdown"
          className="absolute right-0 top-full mt-1 min-w-[140px] bg-[var(--color-bg-base)] border border-[var(--color-bg-border)] rounded-lg shadow-[var(--shadow-elevation-2)] z-50 py-1"
        >
          <button
            type="button"
            data-testid="action-view-details"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              navigate(`/clients/${client.id}`)
            }}
            className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] cursor-pointer"
          >
            View Details
          </button>
          <button
            type="button"
            data-testid="action-edit"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              onEdit(client)
            }}
            className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            data-testid="action-delete"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              onDelete(client)
            }}
            className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--color-priority-high)] hover:bg-[var(--color-hover)] cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function ClientsTable({ clients, onEdit, onDelete }: ClientsTableProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="clients-table">
      {/* Header row */}
      <div
        data-testid="clients-table-header"
        className="grid grid-cols-[1.8fr_0.8fr_0.9fr_1fr_1.2fr_1fr_1.5fr_40px] h-9 items-center text-[12px] font-medium text-[var(--color-text-muted)] border-b border-[var(--color-bg-border)]"
      >
        <span className="px-3">Client Name</span>
        <span className="px-3">Type</span>
        <span className="px-3">Status</span>
        <span className="px-3">Tags</span>
        <span className="px-3">Primary Contact</span>
        <span className="px-3">Open Deals</span>
        <span className="px-3">Next Task</span>
        <span />
      </div>

      {/* Data rows */}
      {clients.map((client) => {
        const sc = statusConfig[client.status] || statusConfig.prospect
        const dealCount = client.open_deal_count || 0
        const dealValue = Number(client.open_deal_value) || 0

        let dealDisplay: string
        if (dealCount === 0) {
          dealDisplay = '0'
        } else if (dealValue > 0) {
          dealDisplay = `${dealCount} (Value: ${formatDealValue(dealValue)})`
        } else {
          dealDisplay = String(dealCount)
        }

        let primaryContactDisplay: string
        if (client.type === 'individual') {
          primaryContactDisplay = `${client.name} (Self)`
        } else if (client.primary_contact_name) {
          const titlePart = client.primary_contact_title ? ` (${client.primary_contact_title})` : ''
          primaryContactDisplay = `${client.primary_contact_name}${titlePart}`
        } else {
          primaryContactDisplay = '—'
        }

        return (
          <div
            key={client.id}
            data-testid="clients-table-row"
            onClick={() => navigate(`/clients/${client.id}`)}
            className="grid grid-cols-[1.8fr_0.8fr_0.9fr_1fr_1.2fr_1fr_1.5fr_40px] h-11 items-center text-[13px] text-[var(--color-text-secondary)] border-b border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-100"
          >
            <span className="px-3 truncate font-medium text-[var(--color-text-primary)]">{client.name}</span>
            <span className="px-3 truncate">{client.type === 'organization' ? 'Organization' : 'Individual'}</span>
            <span className="px-3">
              <span
                className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium"
                style={{ color: sc.color, backgroundColor: sc.bg }}
              >
                {sc.label}
              </span>
            </span>
            <span className="px-3 truncate">
              {client.tags && client.tags.length > 0
                ? client.tags.map((tag, i) => (
                    <span key={i} className="inline-block mr-1 px-1.5 py-0.5 rounded text-[11px] bg-[var(--color-hover)] text-[var(--color-text-muted)]">
                      {tag}
                    </span>
                  ))
                : '—'}
            </span>
            <span className="px-3 truncate">{primaryContactDisplay}</span>
            <span className="px-3 truncate">{dealDisplay}</span>
            <span className="px-3 truncate text-[12px] text-[var(--color-text-muted)]">
              {formatNextTask(client.next_task, client.next_task_due)}
            </span>
            <span className="px-1 flex justify-center">
              <ActionMenu client={client} onEdit={onEdit} onDelete={onDelete} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
