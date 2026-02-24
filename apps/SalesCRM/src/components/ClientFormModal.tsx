import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ClientFormData {
  name: string
  type: string
  status: string
  tags: string[]
  source: string
}

interface ClientFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ClientFormData) => Promise<void>
  title: string
  initial?: Partial<ClientFormData>
}

function TagInput({ tags, onChange, testId }: {
  tags: string[]
  onChange: (tags: string[]) => void
  testId: string
}) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const tag = input.trim()
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="tag-input-wrapper" data-testid={testId}>
      <div className="tag-input-tags">
        {tags.map(tag => (
          <span key={tag} className="tag-input-chip">
            {tag}
            <button
              type="button"
              className="tag-input-remove"
              onClick={() => onChange(tags.filter(t => t !== tag))}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          className="tag-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? 'Type and press Enter...' : ''}
          data-testid={`${testId}-input`}
        />
      </div>
    </div>
  )
}

function TypeSelector({ value, onChange, testId }: {
  value: string
  onChange: (v: string) => void
  testId: string
}) {
  return (
    <div className="type-selector" data-testid={testId}>
      <button
        type="button"
        className={`type-option${value === 'Organization' ? ' selected' : ''}`}
        onClick={() => onChange('Organization')}
        data-testid={`${testId}-organization`}
      >
        Organization
      </button>
      <button
        type="button"
        className={`type-option${value === 'Individual' ? ' selected' : ''}`}
        onClick={() => onChange('Individual')}
        data-testid={`${testId}-individual`}
      >
        Individual
      </button>
    </div>
  )
}

function StatusDropdown({ value, onChange, testId }: {
  value: string
  onChange: (v: string) => void
  testId: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const options = ['Active', 'Inactive', 'Prospect', 'Churned']

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
        <span>{value || 'Select status...'}</span>
        <X size={14} style={{ transform: 'rotate(45deg)', display: 'none' }} />
      </button>
      {open && (
        <div className="form-dropdown-menu">
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

export default function ClientFormModal({ open, onClose, onSubmit, title, initial }: ClientFormModalProps) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState(initial?.type || 'Organization')
  const [status, setStatus] = useState(initial?.status || 'Prospect')
  const [tags, setTags] = useState<string[]>(initial?.tags || [])
  const [source, setSource] = useState(initial?.source || '')
  const [nameError, setNameError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setType(initial?.type || 'Organization')
      setStatus(initial?.status || 'Prospect')
      setTags(initial?.tags || [])
      setSource(initial?.source || '')
      setNameError('')
    }
  }, [open, initial])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('Client name is required')
      return
    }
    setNameError('')
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), type, status, tags, source: source.trim() })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="client-form-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="client-form-modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} data-testid="client-form-modal-close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              className={`form-input${nameError ? ' error' : ''}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError('') }}
              placeholder="Enter client name"
              data-testid="client-form-name"
            />
            {nameError && (
              <span className="form-error" data-testid="client-form-name-error">{nameError}</span>
            )}
          </div>
          <div className="form-field">
            <label className="form-label">Type</label>
            <TypeSelector value={type} onChange={setType} testId="client-form-type" />
          </div>
          <div className="form-field">
            <label className="form-label">Status</label>
            <StatusDropdown value={status} onChange={setStatus} testId="client-form-status" />
          </div>
          <div className="form-field">
            <label className="form-label">Tags</label>
            <TagInput tags={tags} onChange={setTags} testId="client-form-tags" />
          </div>
          <div className="form-field">
            <label className="form-label">Source</label>
            <input
              type="text"
              className="form-input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., Referral, Campaign, Direct"
              data-testid="client-form-source"
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              data-testid="client-form-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              data-testid="client-form-submit"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
