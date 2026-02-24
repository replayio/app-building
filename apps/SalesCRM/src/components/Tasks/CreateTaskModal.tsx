import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import FilterSelect from '../FilterSelect'

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    description: string
    due_date: string
    priority: string
    client_id: string
    assignee_id: string
  }) => Promise<void>
}

interface SelectOption {
  value: string
  label: string
}

const priorityOptions: SelectOption[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
]

export default function CreateTaskModal({ open, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [clientId, setClientId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [clients, setClients] = useState<SelectOption[]>([])
  const [users, setUsers] = useState<SelectOption[]>([])

  useEffect(() => {
    if (open) {
      fetch('/.netlify/functions/clients?limit=200')
        .then((r) => r.json())
        .then((data) => {
          const items = (data.clients || data || []) as Array<{ id: string; name: string }>
          setClients(items.map((c) => ({ value: c.id, label: c.name })))
        })
        .catch(() => {})

      fetch('/.netlify/functions/users')
        .then((r) => r.json())
        .then((data) => {
          const items = (data.users || data || []) as Array<{ id: string; name: string }>
          setUsers(items.map((u) => ({ value: u.id, label: u.name })))
        })
        .catch(() => {})
    }
  }, [open])

  if (!open) return null

  function resetForm() {
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('medium')
    setClientId('')
    setAssigneeId('')
    setError('')
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate,
        priority,
        client_id: clientId,
        assignee_id: assigneeId,
      })
      resetForm()
      onClose()
    } catch {
      setError('Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="create-task-modal">
      <div className="absolute inset-0 bg-black/30" data-testid="modal-overlay" onClick={handleClose} />
      <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Create Task</h2>
          <button type="button" onClick={handleClose} className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <p className="text-[12px] text-[var(--color-priority-high)]">{error}</p>
          )}

          {/* Title */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Title *</label>
            <input
              data-testid="task-form-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Description</label>
            <textarea
              data-testid="task-form-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
              className="w-full px-2.5 py-2 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Due Date</label>
            <input
              data-testid="task-form-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Priority</label>
            <FilterSelect
              data-testid="task-form-priority"
              value={priority}
              onChange={setPriority}
              options={priorityOptions}
              placeholder="Select priority"
            />
          </div>

          {/* Client */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Client</label>
            <FilterSelect
              data-testid="task-form-client"
              value={clientId}
              onChange={setClientId}
              options={[{ value: '', label: 'None' }, ...clients]}
              placeholder="Select client"
              searchable
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Assignee</label>
            <FilterSelect
              data-testid="task-form-assignee"
              value={assigneeId}
              onChange={setAssigneeId}
              options={[{ value: '', label: 'None' }, ...users]}
              placeholder="Select assignee"
              searchable
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              data-testid="create-task-cancel"
              type="button"
              onClick={handleClose}
              className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              data-testid="create-task-submit"
              type="submit"
              disabled={submitting}
              className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
