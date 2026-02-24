import { useState, useEffect } from 'react'
import { ListTodo, Timer, Paperclip, UserPlus, X } from 'lucide-react'
import type { ClientDetail } from '../../store/slices/clientsSlice'
import FilterSelect from '../FilterSelect'

interface ClientQuickActionsProps {
  client: ClientDetail
  onActionComplete: () => void
}

export default function ClientQuickActions({ client, onActionComplete }: ClientQuickActionsProps) {
  const [activeModal, setActiveModal] = useState<'task' | 'deal' | 'attachment' | 'person' | null>(null)

  function closeModal() {
    setActiveModal(null)
  }

  function handleCreated() {
    closeModal()
    onActionComplete()
  }

  return (
    <div data-testid="client-quick-actions" className="flex items-center gap-3 mb-6">
      <button
        data-testid="add-task-button"
        type="button"
        onClick={() => setActiveModal('task')}
        className="flex flex-col items-center gap-1 h-16 w-20 rounded-lg border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-100"
      >
        <ListTodo size={16} className="mt-2.5 text-[var(--color-accent)]" />
        <span className="text-[11px] text-[var(--color-text-muted)]">Add Task</span>
      </button>

      <button
        data-testid="add-deal-button"
        type="button"
        onClick={() => setActiveModal('deal')}
        className="flex flex-col items-center gap-1 h-16 w-20 rounded-lg border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-100"
      >
        <Timer size={16} className="mt-2.5 text-[var(--color-accent)]" />
        <span className="text-[11px] text-[var(--color-text-muted)]">Add Deal</span>
      </button>

      <button
        data-testid="add-attachment-button"
        type="button"
        onClick={() => setActiveModal('attachment')}
        className="flex flex-col items-center gap-1 h-16 w-20 rounded-lg border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-100"
      >
        <Paperclip size={16} className="mt-2.5 text-[var(--color-accent)]" />
        <span className="text-[11px] text-[var(--color-text-muted)]">Add Attachment</span>
      </button>

      <button
        data-testid="add-person-button"
        type="button"
        onClick={() => setActiveModal('person')}
        className="flex flex-col items-center gap-1 h-16 w-20 rounded-lg border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-100"
      >
        <UserPlus size={16} className="mt-2.5 text-[var(--color-accent)]" />
        <span className="text-[11px] text-[var(--color-text-muted)]">Add Person</span>
      </button>

      {activeModal === 'task' && (
        <AddTaskModal clientId={client.id} clientName={client.name} onClose={closeModal} onCreated={handleCreated} />
      )}
      {activeModal === 'deal' && (
        <AddDealModal clientId={client.id} clientName={client.name} onClose={closeModal} onCreated={handleCreated} />
      )}
      {activeModal === 'attachment' && (
        <AddAttachmentModal clientId={client.id} deals={client.deals || []} onClose={closeModal} onCreated={handleCreated} />
      )}
      {activeModal === 'person' && (
        <AddPersonModal clientId={client.id} onClose={closeModal} onCreated={handleCreated} />
      )}
    </div>
  )
}

// ---- Add Task Modal ----
function AddTaskModal({ clientId, clientName, onClose, onCreated }: {
  clientId: string
  clientName: string
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [assigneeId, setAssigneeId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [users, setUsers] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    fetch('/.netlify/functions/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers((data.users || []).map((u: { id: string; name: string }) => ({ value: u.id, label: u.name })))
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/.netlify/functions/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate || null,
          priority,
          client_id: clientId,
          assignee_id: assigneeId || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create task')
      onCreated()
    } catch {
      setError('Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="add-task-modal">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Add Task</h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && <p data-testid="task-form-error" className="text-[12px] text-[var(--color-priority-high)]">{error}</p>}

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Client</label>
            <div className="h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-active)] text-[13px] text-[var(--color-text-muted)] flex items-center">
              {clientName}
            </div>
          </div>

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

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Priority</label>
            <FilterSelect
              data-testid="task-form-priority"
              value={priority}
              onChange={setPriority}
              options={[
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'normal', label: 'Normal' },
                { value: 'low', label: 'Low' },
              ]}
              placeholder="Select priority"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Assignee</label>
            <FilterSelect
              data-testid="task-form-assignee"
              value={assigneeId}
              onChange={setAssigneeId}
              options={[{ value: '', label: 'Unassigned' }, ...users]}
              placeholder="Select assignee"
              searchable
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button data-testid="add-task-cancel" type="button" onClick={onClose} className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer">Cancel</button>
            <button data-testid="add-task-submit" type="submit" disabled={submitting} className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---- Add Deal Modal ----
function AddDealModal({ clientId, clientName, onClose, onCreated }: {
  clientId: string
  clientName: string
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState('lead')
  const [ownerId, setOwnerId] = useState('')
  const [probability, setProbability] = useState('')
  const [expectedCloseDate, setExpectedCloseDate] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [users, setUsers] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    fetch('/.netlify/functions/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers((data.users || []).map((u: { id: string; name: string }) => ({ value: u.id, label: u.name })))
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Deal name is required'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/.netlify/functions/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          client_id: clientId,
          value: value ? parseFloat(value) : null,
          stage,
          owner_id: ownerId || null,
          probability: probability ? parseInt(probability, 10) : null,
          expected_close_date: expectedCloseDate || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create deal')
      onCreated()
    } catch {
      setError('Failed to create deal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="add-deal-modal">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Add Deal</h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && <p data-testid="deal-form-error" className="text-[12px] text-[var(--color-priority-high)]">{error}</p>}

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Client</label>
            <div className="h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-active)] text-[13px] text-[var(--color-text-muted)] flex items-center">
              {clientName}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Deal Name *</label>
            <input data-testid="deal-form-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Deal name"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Value ($)</label>
            <input data-testid="deal-form-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Stage</label>
            <FilterSelect data-testid="deal-form-stage" value={stage} onChange={setStage} options={[
              { value: 'lead', label: 'Lead' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'proposal', label: 'Proposal' },
              { value: 'negotiation', label: 'Negotiation' },
              { value: 'closed_won', label: 'Closed Won' },
              { value: 'closed_lost', label: 'Closed Lost' },
            ]} placeholder="Select stage" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Owner</label>
            <FilterSelect data-testid="deal-form-owner" value={ownerId} onChange={setOwnerId}
              options={[{ value: '', label: 'None' }, ...users]} placeholder="Select owner" searchable />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Probability (%)</label>
            <input data-testid="deal-form-probability" type="number" min="0" max="100" value={probability} onChange={(e) => setProbability(e.target.value)} placeholder="0"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Expected Close Date</label>
            <input data-testid="deal-form-close-date" type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button data-testid="add-deal-cancel" type="button" onClick={onClose} className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer">Cancel</button>
            <button data-testid="add-deal-submit" type="submit" disabled={submitting} className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---- Add Attachment Modal ----
function AddAttachmentModal({ clientId, deals, onClose, onCreated }: {
  clientId: string
  deals: Array<{ id: string; name: string }>
  onClose: () => void
  onCreated: () => void
}) {
  const [mode, setMode] = useState<'file' | 'link'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')
  const [linkedDealId, setLinkedDealId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const dealOptions = [{ value: '', label: 'None' }, ...deals.map((d) => ({ value: d.id, label: d.name }))]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (mode === 'file') {
        if (!file) { setError('Please select a file'); setSubmitting(false); return }

        // Upload via UploadThing or store as data URL for now
        const formData = new FormData()
        formData.append('file', file)

        // For file uploads, we create a temporary URL or use UploadThing
        // For now, create a blob URL placeholder and store the attachment metadata
        const fileUrl = URL.createObjectURL(file)

        const res = await fetch('/.netlify/functions/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            file_url: fileUrl,
            file_type: file.type || null,
            file_size: file.size || null,
            client_id: clientId,
            deal_id: linkedDealId || null,
          }),
        })
        if (!res.ok) throw new Error('Failed to upload')
      } else {
        if (!linkUrl.trim()) { setError('URL is required'); setSubmitting(false); return }
        if (!linkName.trim()) { setError('Name is required'); setSubmitting(false); return }

        const res = await fetch('/.netlify/functions/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: linkName.trim(),
            file_url: linkUrl.trim(),
            file_type: 'link',
            client_id: clientId,
            deal_id: linkedDealId || null,
          }),
        })
        if (!res.ok) throw new Error('Failed to create')
      }
      onCreated()
    } catch {
      setError('Failed to add attachment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="add-attachment-modal">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Add Attachment</h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && <p data-testid="attachment-form-error" className="text-[12px] text-[var(--color-priority-high)]">{error}</p>}

          {/* Mode toggle */}
          <div className="flex gap-1 p-0.5 rounded bg-[var(--color-active)]">
            <button
              data-testid="attachment-mode-file"
              type="button"
              onClick={() => setMode('file')}
              className={`flex-1 h-7 rounded text-[12px] cursor-pointer transition-colors duration-100 ${
                mode === 'file' ? 'bg-[var(--color-bg-base)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)]'
              }`}
            >File Upload</button>
            <button
              data-testid="attachment-mode-link"
              type="button"
              onClick={() => setMode('link')}
              className={`flex-1 h-7 rounded text-[12px] cursor-pointer transition-colors duration-100 ${
                mode === 'link' ? 'bg-[var(--color-bg-base)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)]'
              }`}
            >Link URL</button>
          </div>

          {mode === 'file' ? (
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">File</label>
              <label
                data-testid="attachment-file-picker"
                className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-[var(--color-bg-border)] hover:border-[var(--color-accent)] cursor-pointer transition-colors duration-100"
              >
                <Paperclip size={20} className="text-[var(--color-text-disabled)] mb-1" />
                <span className="text-[12px] text-[var(--color-text-muted)]">
                  {file ? file.name : 'Click to select a file'}
                </span>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">URL *</label>
                <input data-testid="attachment-form-url" type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..."
                  className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Name *</label>
                <input data-testid="attachment-form-name" type="text" value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="Link name"
                  className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
              </div>
            </>
          )}

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Linked Deal</label>
            <FilterSelect data-testid="attachment-form-deal" value={linkedDealId} onChange={setLinkedDealId} options={dealOptions} placeholder="Select deal" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button data-testid="add-attachment-cancel" type="button" onClick={onClose} className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer">Cancel</button>
            <button data-testid="add-attachment-submit" type="submit" disabled={submitting} className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default">
              {submitting ? (mode === 'file' ? 'Uploading...' : 'Adding...') : (mode === 'file' ? 'Upload' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---- Add Person Modal ----
function AddPersonModal({ clientId, onClose, onCreated }: {
  clientId: string
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/.netlify/functions/individuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          location: location.trim() || null,
          client_id: clientId,
        }),
      })
      if (!res.ok) throw new Error('Failed to create person')
      onCreated()
    } catch {
      setError('Failed to create person')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="add-person-modal">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Add Person</h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && <p data-testid="person-form-error" className="text-[12px] text-[var(--color-priority-high)]">{error}</p>}

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Name *</label>
            <input data-testid="person-form-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Title/Role</label>
            <input data-testid="person-form-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CEO, CTO"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Email</label>
            <input data-testid="person-form-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Phone</label>
            <input data-testid="person-form-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Location</label>
            <input data-testid="person-form-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button data-testid="add-person-cancel" type="button" onClick={onClose} className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer">Cancel</button>
            <button data-testid="add-person-submit" type="submit" disabled={submitting} className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
