import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Eye, Pencil, Trash2, ArrowUpDown, ChevronDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { deleteDeal, updateDeal, fetchDeals, setDealsSort, type DealRow } from '@/store/dealsSlice'

function formatValue(value: number | string | null): string {
  if (value === null || value === undefined) return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toISOString().split('T')[0]
}

const dealStatusColors: Record<string, string> = {
  'On Track': 'deal-status-on-track',
  'Needs Attention': 'deal-status-needs-attention',
  'At Risk': 'deal-status-at-risk',
  'Won': 'deal-status-won',
  'Lost': 'deal-status-lost',
}

function RowActionMenu({ deal, onEdit, onDelete }: {
  deal: DealRow
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
        data-testid={`deal-actions-${deal.id}`}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="row-action-menu" data-testid={`deal-action-menu-${deal.id}`}>
          <button
            className="row-action-item"
            onClick={() => { setOpen(false); navigate(`/deals/${deal.id}`) }}
            data-testid={`deal-action-view-${deal.id}`}
          >
            <Eye size={14} />
            <span>View Details</span>
          </button>
          <button
            className="row-action-item"
            onClick={() => { setOpen(false); onEdit() }}
            data-testid={`deal-action-edit-${deal.id}`}
          >
            <Pencil size={14} />
            <span>Edit</span>
          </button>
          <button
            className="row-action-item danger"
            onClick={() => { setOpen(false); onDelete() }}
            data-testid={`deal-action-delete-${deal.id}`}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}

function DeleteConfirmModal({ open, dealName, onConfirm, onCancel }: {
  open: boolean
  dealName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onCancel} data-testid="deal-delete-confirm-modal">
      <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Delete Deal</h2>
        <p className="modal-text" data-testid="deal-delete-confirm-message">
          Are you sure you want to delete {dealName}?
        </p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} data-testid="deal-delete-cancel">
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} data-testid="deal-delete-confirm">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function EditDealModal({ open, deal, onSave, onCancel }: {
  open: boolean
  deal: DealRow | null
  onSave: (data: { id: string; name: string; client_id: string; stage: string; owner: string; value: string; close_date: string; status: string }) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [stage, setStage] = useState('')
  const [owner, setOwner] = useState('')
  const [value, setValue] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [allClients, setAllClients] = useState<{ id: string; name: string }[]>([])
  const clientRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (deal) {
      setName(deal.name)
      setClientId(deal.client_id)
      setStage(deal.stage)
      setOwner(deal.owner || '')
      const v = deal.value
      setValue(v !== null && v !== undefined ? String(v) : '')
      setCloseDate(deal.close_date ? deal.close_date.split('T')[0] : '')
      setStatus(deal.status)
    }
  }, [deal])

  useEffect(() => {
    if (open) {
      fetch('/.netlify/functions/clients?page=1&pageSize=1000')
        .then(r => r.json())
        .then(data => setAllClients((data.clients || []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))))
        .catch(() => {})
    }
  }, [open])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) setClientDropdownOpen(false)
      if (stageRef.current && !stageRef.current.contains(e.target as Node)) setStageDropdownOpen(false)
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!open || !deal) return null

  const stages = ['Lead', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won']
  const statuses = ['On Track', 'Needs Attention', 'At Risk']
  const selectedClient = allClients.find(c => c.id === clientId)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ id: deal.id, name, client_id: clientId, stage, owner, value, close_date: closeDate, status })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel} data-testid="deal-edit-modal">
      <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Deal</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-field">
            <label className="form-label">Deal Name *</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="deal-edit-name"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Client</label>
            <div className="form-dropdown-wrapper" ref={clientRef}>
              <button
                className="form-dropdown-trigger"
                onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                data-testid="deal-edit-client"
              >
                <span>{selectedClient?.name || 'Select client'}</span>
                <ChevronDown size={14} />
              </button>
              {clientDropdownOpen && (
                <div className="form-dropdown-menu">
                  {allClients.map(c => (
                    <button
                      key={c.id}
                      className={`form-dropdown-option${c.id === clientId ? ' selected' : ''}`}
                      onClick={() => { setClientId(c.id); setClientDropdownOpen(false) }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Stage</label>
            <div className="form-dropdown-wrapper" ref={stageRef}>
              <button
                className="form-dropdown-trigger"
                onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
                data-testid="deal-edit-stage"
              >
                <span>{stage}</span>
                <ChevronDown size={14} />
              </button>
              {stageDropdownOpen && (
                <div className="form-dropdown-menu">
                  {stages.map(s => (
                    <button
                      key={s}
                      className={`form-dropdown-option${s === stage ? ' selected' : ''}`}
                      onClick={() => { setStage(s); setStageDropdownOpen(false) }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Owner</label>
            <input
              className="form-input"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              data-testid="deal-edit-owner"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Value</label>
            <input
              className="form-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="$0"
              data-testid="deal-edit-value"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Close Date</label>
            <input
              type="date"
              className="form-input"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              data-testid="deal-edit-close-date"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Status</label>
            <div className="form-dropdown-wrapper" ref={statusRef}>
              <button
                className="form-dropdown-trigger"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                data-testid="deal-edit-status"
              >
                <span>{status}</span>
                <ChevronDown size={14} />
              </button>
              {statusDropdownOpen && (
                <div className="form-dropdown-menu">
                  {statuses.map(s => (
                    <button
                      key={s}
                      className={`form-dropdown-option${s === status ? ' selected' : ''}`}
                      onClick={() => { setStatus(s); setStatusDropdownOpen(false) }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} data-testid="deal-edit-cancel">
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            data-testid="deal-edit-save"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DealsTable() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector(s => s.deals.items)
  const loading = useAppSelector(s => s.deals.loading)
  const sort = useAppSelector(s => s.deals.filters.sort)
  const [editDeal, setEditDeal] = useState<DealRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DealRow | null>(null)

  const handleUpdate = async (data: { id: string; name: string; client_id: string; stage: string; owner: string; value: string; close_date: string; status: string }) => {
    await dispatch(updateDeal(data)).unwrap()
    setEditDeal(null)
    await dispatch(fetchDeals())
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await dispatch(deleteDeal(deleteTarget.id)).unwrap()
    setDeleteTarget(null)
    await dispatch(fetchDeals())
  }

  const handleSortByCloseDate = () => {
    if (sort === 'close_date_newest') {
      dispatch(setDealsSort('close_date_oldest'))
    } else {
      dispatch(setDealsSort('close_date_newest'))
    }
  }

  if (loading) {
    return (
      <div className="clients-table-empty" data-testid="deals-table-loading">
        <p>Loading deals...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="clients-table-empty" data-testid="deals-table-empty">
        <p className="empty-title">No deals found</p>
        <p className="empty-subtitle">No deals yet. Create your first deal to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="deals-table" data-testid="deals-table">
        <div className="deals-table-header">
          <div className="table-cell">Deal Name</div>
          <div className="table-cell">Client</div>
          <div className="table-cell">Stage</div>
          <div className="table-cell">Owner</div>
          <div className="table-cell">Value</div>
          <div className="table-cell">
            <button
              className="deals-table-sort-btn"
              onClick={handleSortByCloseDate}
              data-testid="deals-sort-close-date"
            >
              Close Date
              <ArrowUpDown size={12} />
            </button>
          </div>
          <div className="table-cell">Status</div>
          <div className="table-cell table-cell-action"></div>
        </div>
        {items.map((deal) => (
          <div
            key={deal.id}
            className="deals-table-row"
            data-testid={`deal-row-${deal.id}`}
          >
            <div className="table-cell">
              <button
                className="client-name-link"
                onClick={() => navigate(`/deals/${deal.id}`)}
                data-testid={`deal-name-${deal.id}`}
              >
                {deal.name}
              </button>
            </div>
            <div className="table-cell" data-testid={`deal-client-${deal.id}`}>
              {deal.client_name || '—'}
            </div>
            <div className="table-cell" data-testid={`deal-stage-${deal.id}`}>
              {deal.stage}
            </div>
            <div className="table-cell" data-testid={`deal-owner-${deal.id}`}>
              {deal.owner || '—'}
            </div>
            <div className="table-cell" data-testid={`deal-value-${deal.id}`}>
              {formatValue(deal.value)}
            </div>
            <div className="table-cell" data-testid={`deal-close-date-${deal.id}`}>
              {formatDate(deal.close_date)}
            </div>
            <div className="table-cell">
              <span
                className={`status-badge ${dealStatusColors[deal.status] || ''}`}
                data-testid={`deal-status-${deal.id}`}
              >
                {deal.status}
              </span>
            </div>
            <div className="table-cell table-cell-action">
              <RowActionMenu
                deal={deal}
                onEdit={() => setEditDeal(deal)}
                onDelete={() => setDeleteTarget(deal)}
              />
            </div>
          </div>
        ))}
      </div>

      <EditDealModal
        open={!!editDeal}
        deal={editDeal}
        onSave={handleUpdate}
        onCancel={() => setEditDeal(null)}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        dealName={deleteTarget?.name || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
