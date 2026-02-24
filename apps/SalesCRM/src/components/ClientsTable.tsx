import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { deleteClient, updateClient, fetchClients, type ClientRow } from '@/store/clientsSlice'
import ClientFormModal from './ClientFormModal'

function formatValue(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${Math.round(value / 1000)}k`
  return `$${value.toFixed(0)}`
}

function formatTaskDate(dateStr: string | null): string {
  if (!dateStr) return 'No date'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (date.toDateString() === today.toDateString()) return `Today, ${time}`
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${time}`
}

const statusColors: Record<string, string> = {
  Active: 'status-active',
  Inactive: 'status-inactive',
  Prospect: 'status-prospect',
  Churned: 'status-churned',
}

function RowActionMenu({ client, onEdit, onDelete }: {
  client: ClientRow
  onEdit: () => void
  onDelete: () => void
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="row-action-wrapper" ref={ref}>
      <button
        className="row-action-trigger"
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        data-testid={`client-actions-${client.id}`}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="row-action-menu" data-testid={`action-menu-${client.id}`}>
          <button
            className="row-action-item"
            onClick={() => { setOpen(false); navigate(`/clients/${client.id}`) }}
            data-testid={`action-view-${client.id}`}
          >
            <Eye size={14} />
            <span>View Details</span>
          </button>
          <button
            className="row-action-item"
            onClick={() => { setOpen(false); onEdit() }}
            data-testid={`action-edit-${client.id}`}
          >
            <Pencil size={14} />
            <span>Edit</span>
          </button>
          <button
            className="row-action-item danger"
            onClick={() => { setOpen(false); onDelete() }}
            data-testid={`action-delete-${client.id}`}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}

function DeleteConfirmModal({ open, clientName, onConfirm, onCancel }: {
  open: boolean
  clientName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onCancel} data-testid="delete-confirm-modal">
      <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Delete Client</h2>
        <p className="modal-text" data-testid="delete-confirm-message">
          Are you sure you want to delete {clientName}?
        </p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} data-testid="delete-cancel">
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} data-testid="delete-confirm">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientsTable() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector(s => s.clients.items)
  const loading = useAppSelector(s => s.clients.loading)
  const [editClient, setEditClient] = useState<ClientRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null)

  const handleUpdate = async (data: { name: string; type: string; status: string; tags: string[]; source: string }) => {
    if (!editClient) return
    await dispatch(updateClient({ id: editClient.id, ...data })).unwrap()
    await dispatch(fetchClients())
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await dispatch(deleteClient(deleteTarget.id)).unwrap()
    setDeleteTarget(null)
    await dispatch(fetchClients())
  }

  if (loading) {
    return (
      <div className="clients-table-empty" data-testid="clients-table-loading">
        <p>Loading clients...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="clients-table-empty" data-testid="clients-table-empty">
        <p className="empty-title">No clients found</p>
        <p className="empty-subtitle">No clients yet. Add your first client to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="clients-table" data-testid="clients-table">
        <div className="clients-table-header">
          <div className="table-cell">Client Name</div>
          <div className="table-cell">Type</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Tags</div>
          <div className="table-cell">Primary Contact</div>
          <div className="table-cell">Open Deals</div>
          <div className="table-cell">Next Task</div>
          <div className="table-cell table-cell-action"></div>
        </div>
        {items.map((client) => {
          const pc = client.primary_contact
          const od = client.open_deals
          const nt = client.next_task

          const contactDisplay = pc
            ? client.type === 'Individual' && pc.name === client.name
              ? `${client.name} (Self)`
              : `${pc.name}${pc.role ? ` (${pc.role})` : ''}`
            : '—'

          const dealsDisplay = od && od.count > 0
            ? `${od.count} (Value: ${formatValue(Number(od.totalValue))})`
            : '0'

          const taskDisplay = nt
            ? `${nt.title} - ${formatTaskDate(nt.dueDate)}`
            : 'No task scheduled'

          return (
            <div
              key={client.id}
              className="clients-table-row"
              data-testid={`client-row-${client.id}`}
            >
              <div className="table-cell">
                <button
                  className="client-name-link"
                  onClick={() => navigate(`/clients/${client.id}`)}
                  data-testid={`client-name-${client.id}`}
                >
                  {client.name}
                </button>
              </div>
              <div className="table-cell table-cell-type" data-testid={`client-type-${client.id}`}>
                {client.type}
              </div>
              <div className="table-cell">
                <span
                  className={`status-badge ${statusColors[client.status] || ''}`}
                  data-testid={`client-status-${client.id}`}
                >
                  {client.status}
                </span>
              </div>
              <div className="table-cell table-cell-tags" data-testid={`client-tags-${client.id}`}>
                {(client.tags || []).map(tag => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
              <div className="table-cell table-cell-contact" data-testid={`client-contact-${client.id}`}>
                {contactDisplay}
              </div>
              <div className="table-cell" data-testid={`client-deals-${client.id}`}>
                {dealsDisplay}
              </div>
              <div className="table-cell table-cell-task" data-testid={`client-task-${client.id}`}>
                {taskDisplay}
              </div>
              <div className="table-cell table-cell-action">
                <RowActionMenu
                  client={client}
                  onEdit={() => setEditClient(client)}
                  onDelete={() => setDeleteTarget(client)}
                />
              </div>
            </div>
          )
        })}
      </div>

      <ClientFormModal
        open={!!editClient}
        onClose={() => setEditClient(null)}
        onSubmit={handleUpdate}
        title="Edit Client"
        initial={editClient ? {
          name: editClient.name,
          type: editClient.type,
          status: editClient.status,
          tags: editClient.tags || [],
          source: editClient.source || '',
        } : undefined}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        clientName={deleteTarget?.name || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
