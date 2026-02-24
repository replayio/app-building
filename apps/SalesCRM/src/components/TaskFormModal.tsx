import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, Search } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import type { ClientOption, DealOption, AssigneeOption } from '@/store/tasksSlice'

interface TaskFormData {
  title: string
  due_date: string
  priority: string
  assignee: string
  assignee_role: string
  client_id: string
  deal_id: string
}

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<void>
  title: string
  initial?: Partial<TaskFormData>
}

function abbreviateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function SearchableSelect<T extends { label: string; value: string }>({
  options,
  value,
  onChange,
  placeholder,
  testId,
}: {
  options: T[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  testId: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const selected = options.find(o => o.value === value)

  return (
    <div className="form-dropdown-wrapper" ref={ref} data-testid={testId}>
      <button
        type="button"
        className="form-dropdown-trigger"
        onClick={() => setOpen(!open)}
        data-testid={`${testId}-trigger`}
      >
        <span style={{ color: selected ? undefined : 'var(--color-text-disabled)' }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="form-dropdown-menu" data-testid={`${testId}-menu`}>
          <div className="searchable-select-search">
            <Search size={14} className="searchable-select-icon" />
            <input
              ref={inputRef}
              type="text"
              className="searchable-select-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid={`${testId}-search`}
            />
          </div>
          <div className="searchable-select-options">
            <button
              type="button"
              className={`form-dropdown-option${!value ? ' selected' : ''}`}
              onClick={() => { onChange(''); setOpen(false); setSearch('') }}
              data-testid={`${testId}-option-none`}
            >
              None
            </button>
            {filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`form-dropdown-option${opt.value === value ? ' selected' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); setSearch('') }}
                data-testid={`${testId}-option-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="searchable-select-empty">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PriorityDropdown({ value, onChange, testId }: {
  value: string
  onChange: (v: string) => void
  testId: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const options = ['High', 'Medium', 'Low', 'Normal']

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="form-dropdown-wrapper" ref={ref} data-testid={testId}>
      <button
        type="button"
        className="form-dropdown-trigger"
        onClick={() => setOpen(!open)}
        data-testid={`${testId}-trigger`}
      >
        <span>{value}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="form-dropdown-menu" data-testid={`${testId}-menu`}>
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              className={`form-dropdown-option${opt === value ? ' selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}
              data-testid={`${testId}-option-${opt.toLowerCase()}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TaskFormModal({ open, onClose, onSubmit, title, initial }: TaskFormModalProps) {
  const clients = useAppSelector(s => s.tasks.clients)
  const deals = useAppSelector(s => s.tasks.deals)
  const assignees = useAppSelector(s => s.tasks.assignees)

  const [taskName, setTaskName] = useState(initial?.title || '')
  const [dueDate, setDueDate] = useState(initial?.due_date || '')
  const [priority, setPriority] = useState(initial?.priority || 'Normal')
  const [assignee, setAssignee] = useState(initial?.assignee || '')
  const [assigneeRole, setAssigneeRole] = useState(initial?.assignee_role || '')
  const [clientId, setClientId] = useState(initial?.client_id || '')
  const [dealId, setDealId] = useState(initial?.deal_id || '')
  const [nameError, setNameError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setTaskName(initial?.title || '')
      setDueDate(initial?.due_date ? formatDatetimeLocal(initial.due_date) : '')
      setPriority(initial?.priority || 'Normal')
      setAssignee(initial?.assignee || '')
      setAssigneeRole(initial?.assignee_role || '')
      setClientId(initial?.client_id || '')
      setDealId(initial?.deal_id || '')
      setNameError('')
    }
  }, [open, initial])

  if (!open) return null

  const clientOptions: { label: string; value: string }[] = clients.map((c: ClientOption) => ({
    label: c.name,
    value: c.id,
  }))

  const filteredDeals = clientId
    ? deals.filter((d: DealOption) => d.client_id === clientId)
    : deals

  const dealOptions: { label: string; value: string }[] = filteredDeals.map((d: DealOption) => ({
    label: d.name,
    value: d.id,
  }))

  const assigneeOptions: { label: string; value: string }[] = assignees.map((a: AssigneeOption) => ({
    label: a.role ? `${abbreviateName(a.name)} (${a.role})` : abbreviateName(a.name),
    value: `${a.name}::${a.role || ''}`,
  }))

  const handleClientChange = (id: string) => {
    setClientId(id)
    if (dealId) {
      const deal = deals.find((d: DealOption) => d.id === dealId)
      if (deal && deal.client_id !== id) {
        setDealId('')
      }
    }
  }

  const handleAssigneeChange = (val: string) => {
    if (!val) {
      setAssignee('')
      setAssigneeRole('')
      return
    }
    const [name, role] = val.split('::')
    setAssignee(name)
    setAssigneeRole(role || '')
  }

  const currentAssigneeValue = assignee ? `${assignee}::${assigneeRole}` : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim()) {
      setNameError('Task name is required')
      return
    }
    setNameError('')
    setSubmitting(true)
    try {
      await onSubmit({
        title: taskName.trim(),
        due_date: dueDate ? new Date(dueDate).toISOString() : '',
        priority,
        assignee,
        assignee_role: assigneeRole,
        client_id: clientId,
        deal_id: dealId,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="task-form-modal">
      <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()} data-testid="task-form-modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} data-testid="task-form-modal-close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label className="form-label">Task Name *</label>
            <input
              type="text"
              className={`form-input${nameError ? ' error' : ''}`}
              value={taskName}
              onChange={(e) => { setTaskName(e.target.value); setNameError('') }}
              placeholder="Enter task name"
              data-testid="task-form-name"
            />
            {nameError && (
              <span className="form-error" data-testid="task-form-name-error">{nameError}</span>
            )}
          </div>
          <div className="form-field">
            <label className="form-label">Due Date</label>
            <input
              type="datetime-local"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              data-testid="task-form-due-date"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Priority</label>
            <PriorityDropdown
              value={priority}
              onChange={setPriority}
              testId="task-form-priority"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Assignee</label>
            <SearchableSelect
              options={assigneeOptions}
              value={currentAssigneeValue}
              onChange={handleAssigneeChange}
              placeholder="Select assignee..."
              testId="task-form-assignee"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Client</label>
            <SearchableSelect
              options={clientOptions}
              value={clientId}
              onChange={handleClientChange}
              placeholder="Select client..."
              testId="task-form-client"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Deal (optional)</label>
            <SearchableSelect
              options={dealOptions}
              value={dealId}
              onChange={setDealId}
              placeholder="Select deal..."
              testId="task-form-deal"
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              data-testid="task-form-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              data-testid="task-form-submit"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function formatDatetimeLocal(isoString: string): string {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}
