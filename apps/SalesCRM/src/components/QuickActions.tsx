import { useState, useEffect, useRef } from 'react'

interface QuickActionsProps {
  clientId: string
  clientName: string
  onTaskCreated: () => void
  onDealCreated: () => void
  onAttachmentUploaded: () => void
  onPersonAdded: () => void
}

export default function QuickActions({
  clientId,
  clientName,
  onTaskCreated,
  onDealCreated,
  onAttachmentUploaded,
  onPersonAdded,
}: QuickActionsProps) {
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showDealModal, setShowDealModal] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [showPersonModal, setShowPersonModal] = useState(false)

  return (
    <div className="quick-actions" data-testid="quick-actions">
      <button
        className="btn-ghost"
        onClick={() => setShowTaskModal(true)}
        data-testid="quick-action-add-task"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="m16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.854z"/>
        </svg>
        Add Task
      </button>
      <button
        className="btn-ghost"
        onClick={() => setShowDealModal(true)}
        data-testid="quick-action-add-deal"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Add Deal
      </button>
      <button
        className="btn-ghost"
        onClick={() => setShowAttachmentModal(true)}
        data-testid="quick-action-add-attachment"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        Add Attachment
      </button>
      <button
        className="btn-ghost"
        onClick={() => setShowPersonModal(true)}
        data-testid="quick-action-add-person"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
        Add Person
      </button>

      {showTaskModal && (
        <AddTaskModal
          clientId={clientId}
          onClose={() => setShowTaskModal(false)}
          onSaved={() => { setShowTaskModal(false); onTaskCreated() }}
        />
      )}
      {showDealModal && (
        <AddDealModal
          clientId={clientId}
          clientName={clientName}
          onClose={() => setShowDealModal(false)}
          onSaved={() => { setShowDealModal(false); onDealCreated() }}
        />
      )}
      {showAttachmentModal && (
        <AddAttachmentModal
          clientId={clientId}
          onClose={() => setShowAttachmentModal(false)}
          onSaved={() => { setShowAttachmentModal(false); onAttachmentUploaded() }}
        />
      )}
      {showPersonModal && (
        <AddPersonModal
          clientId={clientId}
          onClose={() => setShowPersonModal(false)}
          onSaved={() => { setShowPersonModal(false); onPersonAdded() }}
        />
      )}
    </div>
  )
}

// ==================== Add Task Modal ====================

function AddTaskModal({ clientId, onClose, onSaved }: { clientId: string; onClose: () => void; onSaved: () => void }) {
  const [taskName, setTaskName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [assignee, setAssignee] = useState('')
  const [dealId, setDealId] = useState('')
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/.netlify/functions/clients/${clientId}/deals`)
      .then(r => r.json())
      .then(data => setDeals(data.deals || []))
      .catch(() => {})
  }, [clientId])

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!taskName.trim()) newErrors.title = 'Task name is required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setSaving(true)
    try {
      const res = await fetch('/.netlify/functions/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskName.trim(),
          client_id: clientId,
          deal_id: dealId || null,
          due_date: dueDate || null,
          priority,
          assignee: assignee || null,
        }),
      })
      if (res.ok) {
        await fetch(`/.netlify/functions/clients/${clientId}/timeline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'task_created',
            title: 'Task Created: ' + taskName.trim(),
            description: `Task "${taskName.trim()}" was created`,
          }),
        })
        onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" data-testid="task-creation-dialog">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Task</h3>
          <button className="modal-close" onClick={onClose} data-testid="add-task-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-form">
          <div className="form-field">
            <label className="form-label">Task Name *</label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              value={taskName}
              onChange={e => { setTaskName(e.target.value); setErrors({}) }}
              placeholder="Enter task name..."
              data-testid="add-task-name-input"
            />
            {errors.title && <span className="form-error" data-testid="add-task-name-error">{errors.title}</span>}
          </div>
          <div className="form-field">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              data-testid="add-task-due-date-input"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Priority</label>
            <div className="type-selector">
              {['High', 'Medium', 'Low', 'Normal'].map(p => (
                <button
                  key={p}
                  className={`type-option ${priority === p ? 'selected' : ''}`}
                  onClick={() => setPriority(p)}
                  data-testid={`add-task-priority-${p.toLowerCase()}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Assignee</label>
            <input
              type="text"
              className="form-input"
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              placeholder="Enter assignee name..."
              data-testid="add-task-assignee-input"
            />
          </div>
          {deals.length > 0 && (
            <div className="form-field">
              <label className="form-label">Deal (optional)</label>
              <DealDropdown deals={deals} value={dealId} onChange={setDealId} testIdPrefix="add-task" />
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="add-task-cancel">Cancel</button>
          <button className="btn-primary" disabled={saving} onClick={handleSubmit} data-testid="add-task-save">
            {saving ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Add Deal Modal ====================

const STAGES = ['Lead', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won'] as const

function AddDealModal({ clientId, clientName, onClose, onSaved }: { clientId: string; clientName: string; onClose: () => void; onSaved: () => void }) {
  const [dealName, setDealName] = useState('')
  const [stage, setStage] = useState('Lead')
  const [value, setValue] = useState('')
  const [owner, setOwner] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!dealName.trim()) newErrors.name = 'Deal name is required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setSaving(true)
    try {
      const res = await fetch('/.netlify/functions/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dealName.trim(),
          client_id: clientId,
          stage,
          value: value ? parseFloat(value.replace(/[$,]/g, '')) : null,
          owner: owner || null,
        }),
      })
      if (res.ok) {
        onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" data-testid="deal-creation-dialog">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Deal for {clientName}</h3>
          <button className="modal-close" onClick={onClose} data-testid="add-deal-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-form">
          <div className="form-field">
            <label className="form-label">Deal Name *</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={dealName}
              onChange={e => { setDealName(e.target.value); setErrors({}) }}
              placeholder="Enter deal name..."
              data-testid="add-deal-name-input"
            />
            {errors.name && <span className="form-error" data-testid="add-deal-name-error">{errors.name}</span>}
          </div>
          <div className="form-field">
            <label className="form-label">Stage</label>
            <StageDropdown value={stage} onChange={setStage} />
          </div>
          <div className="form-field">
            <label className="form-label">Value</label>
            <input
              type="text"
              className="form-input"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="$0.00"
              data-testid="add-deal-value-input"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Owner</label>
            <input
              type="text"
              className="form-input"
              value={owner}
              onChange={e => setOwner(e.target.value)}
              placeholder="Deal owner..."
              data-testid="add-deal-owner-input"
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="add-deal-cancel">Cancel</button>
          <button className="btn-primary" disabled={saving} onClick={handleSubmit} data-testid="add-deal-save">
            {saving ? 'Creating...' : 'Create Deal'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Add Attachment Modal ====================

function AddAttachmentModal({ clientId, onClose, onSaved }: { clientId: string; onClose: () => void; onSaved: () => void }) {
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([])
  const [dealId, setDealId] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/.netlify/functions/clients/${clientId}/deals`)
      .then(r => r.json())
      .then(data => setDeals(data.deals || []))
      .catch(() => {})
  }, [clientId])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      })

      let fileUrl = ''
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json()
        fileUrl = uploadData.url || ''
      } else {
        fileUrl = URL.createObjectURL(file)
      }

      const res = await fetch(`/.netlify/functions/clients/${clientId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          file_type: file.type || 'application/octet-stream',
          file_url: fileUrl,
          file_size: formatFileSize(file.size),
          deal_id: dealId || null,
        }),
      })

      if (res.ok) {
        onSaved()
      }
    } catch {
      // silently fail
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="modal-overlay" data-testid="attachment-upload-dialog">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Attachment</h3>
          <button className="modal-close" onClick={onClose} data-testid="add-attachment-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-form">
          {deals.length > 0 && (
            <div className="form-field">
              <label className="form-label">Link to Deal (optional)</label>
              <DealDropdown deals={deals} value={dealId} onChange={setDealId} testIdPrefix="add-attachment" />
            </div>
          )}
          <div className="form-field">
            <label className="form-label">File</label>
            <div
              className="import-dropzone"
              onClick={() => fileInputRef.current?.click()}
              data-testid="add-attachment-dropzone"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="import-dropzone-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="import-dropzone-text">
                {uploading ? 'Uploading...' : 'Click to select a file'}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              disabled={uploading}
              data-testid="add-attachment-file-input"
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="add-attachment-cancel">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ==================== Add Person Modal ====================

interface SearchResult {
  id: string
  name: string
  title: string | null
  email: string | null
}

function AddPersonModal({ clientId, onClose, onSaved }: { clientId: string; onClose: () => void; onSaved: () => void }) {
  const [mode, setMode] = useState<'search' | 'create'>('search')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<SearchResult | null>(null)
  const [role, setRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // For create new
  const [newName, setNewName] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search.trim()) { setResults([]); return }
      setSearching(true)
      try {
        const res = await fetch(`/.netlify/functions/individuals?search=${encodeURIComponent(search)}`)
        const data = await res.json()
        setResults(data.individuals || [])
      } catch {
        // silently fail
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleAssociate = async () => {
    if (!selectedPerson) {
      setErrors({ person: 'Person is required' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ individual_id: selectedPerson.id, role: role || null }),
      })
      if (res.ok) onSaved()
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNew = async () => {
    const newErrors: Record<string, string> = {}
    if (!newName.trim()) newErrors.name = 'Name is required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setSaving(true)
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          create_new: true,
          name: newName.trim(),
          title: newTitle || null,
          email: newEmail || null,
          phone: newPhone || null,
          role: role || null,
        }),
      })
      if (res.ok) onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" data-testid="person-association-dialog">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Person</h3>
          <button className="modal-close" onClick={onClose} data-testid="add-person-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="person-tabs" style={{ marginBottom: '16px' }}>
          <button
            className={`person-tab ${mode === 'search' ? 'active' : ''}`}
            onClick={() => setMode('search')}
            data-testid="add-person-tab-search"
          >
            Search Existing
          </button>
          <button
            className={`person-tab ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
            data-testid="add-person-tab-create"
          >
            Create New
          </button>
        </div>

        {mode === 'search' ? (
          <div className="modal-form">
            <div className="form-field">
              <label className="form-label">Person *</label>
              {selectedPerson ? (
                <div className="selected-person-chip" data-testid="add-person-selected">
                  {selectedPerson.name}
                  <button className="tag-input-remove" onClick={() => setSelectedPerson(null)} data-testid="add-person-clear-selection">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="searchable-select-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="searchable-select-icon">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      className="searchable-select-input"
                      value={search}
                      onChange={e => { setSearch(e.target.value); setErrors({}) }}
                      placeholder="Type a name to search..."
                      autoFocus
                      data-testid="add-person-search-input"
                    />
                  </div>
                  <div className="searchable-select-options" data-testid="add-person-results">
                    {searching ? (
                      <div className="searchable-select-empty">Searching...</div>
                    ) : results.length > 0 ? (
                      results.map(person => (
                        <button
                          key={person.id}
                          className="deal-contact-search-result"
                          onClick={() => { setSelectedPerson(person); setErrors({}) }}
                          data-testid="add-person-result"
                        >
                          <span className="deal-contact-search-name">{person.name}</span>
                          {person.title && <span className="deal-contact-search-title"> - {person.title}</span>}
                        </button>
                      ))
                    ) : search.trim() ? (
                      <div className="searchable-select-empty">No matching individuals found</div>
                    ) : (
                      <div className="searchable-select-empty">Start typing to search</div>
                    )}
                  </div>
                </>
              )}
              {errors.person && <span className="form-error">{errors.person}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">Role/Title</label>
              <input
                type="text"
                className="form-input"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. CEO, Decision Maker..."
                data-testid="add-person-role-input"
              />
            </div>
          </div>
        ) : (
          <div className="modal-form">
            <div className="form-field">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={newName}
                onChange={e => { setNewName(e.target.value); setErrors({}) }}
                placeholder="Full name..."
                data-testid="add-person-name-input"
              />
              {errors.name && <span className="form-error" data-testid="add-person-name-error">{errors.name}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. CEO, VP of Sales..."
                data-testid="add-person-title-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Role</label>
              <input
                type="text"
                className="form-input"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Decision Maker, Influencer..."
                data-testid="add-person-create-role-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Email address..."
                data-testid="add-person-email-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-input"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="Phone number..."
                data-testid="add-person-phone-input"
              />
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="add-person-cancel">Cancel</button>
          <button
            className="btn-primary"
            disabled={saving}
            onClick={mode === 'search' ? handleAssociate : handleCreateNew}
            data-testid="add-person-save"
          >
            {saving ? 'Saving...' : mode === 'search' ? 'Add Person' : 'Create & Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Shared Components ====================

function DealDropdown({ deals, value, onChange, testIdPrefix }: { deals: { id: string; name: string }[]; value: string; onChange: (v: string) => void; testIdPrefix: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = deals.find(d => d.id === value)

  return (
    <div className="form-dropdown-wrapper" ref={ref}>
      <button
        className="form-dropdown-trigger"
        onClick={() => setOpen(!open)}
        data-testid={`${testIdPrefix}-deal-dropdown`}
      >
        <span>{selected ? selected.name : 'None'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="form-dropdown-menu" data-testid={`${testIdPrefix}-deal-dropdown-menu`}>
          <button
            className={`form-dropdown-option ${!value ? 'selected' : ''}`}
            onClick={() => { onChange(''); setOpen(false) }}
            data-testid={`${testIdPrefix}-deal-option-none`}
          >
            None
          </button>
          {deals.map(d => (
            <button
              key={d.id}
              className={`form-dropdown-option ${value === d.id ? 'selected' : ''}`}
              onClick={() => { onChange(d.id); setOpen(false) }}
              data-testid={`${testIdPrefix}-deal-option`}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StageDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="form-dropdown-wrapper" ref={ref}>
      <button
        className="form-dropdown-trigger"
        onClick={() => setOpen(!open)}
        data-testid="add-deal-stage-dropdown"
      >
        <span>{value}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="form-dropdown-menu" data-testid="add-deal-stage-dropdown-menu">
          {STAGES.map(s => (
            <button
              key={s}
              className={`form-dropdown-option ${value === s ? 'selected' : ''}`}
              onClick={() => { onChange(s); setOpen(false) }}
              data-testid="add-deal-stage-option"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
