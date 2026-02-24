import { useState, useRef, useEffect } from 'react'

const STATUSES = ['Active', 'Inactive', 'Prospect', 'Churned'] as const

interface ClientHeaderProps {
  name: string
  type: string
  status: string
  tags: string[]
  source: string | null
  onUpdateName: (name: string) => Promise<void>
  onUpdateStatus: (status: string) => Promise<void>
  onUpdateTags: (tags: string[]) => Promise<void>
}

export default function ClientHeader({
  name,
  type,
  status,
  tags,
  source,
  onUpdateName,
  onUpdateStatus,
  onUpdateTags,
}: ClientHeaderProps) {
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(name)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [editingTags, setEditingTags] = useState(false)
  const [localTags, setLocalTags] = useState<string[]>(tags)
  const [tagInput, setTagInput] = useState('')

  const nameInputRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setNameValue(name) }, [name])
  useEffect(() => { setLocalTags(tags) }, [tags])

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  useEffect(() => {
    if (editingTags && tagInputRef.current) {
      tagInputRef.current.focus()
    }
  }, [editingTags])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNameSave = async () => {
    if (nameValue.trim() && nameValue !== name) {
      await onUpdateName(nameValue.trim())
    } else {
      setNameValue(name)
    }
    setEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSave()
    if (e.key === 'Escape') { setNameValue(name); setEditingName(false) }
  }

  const handleStatusSelect = async (newStatus: string) => {
    setStatusDropdownOpen(false)
    if (newStatus !== status) {
      await onUpdateStatus(newStatus)
    }
  }

  const statusClass = `status-${status.toLowerCase()}`

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (!localTags.includes(newTag)) {
        setLocalTags([...localTags, newTag])
      }
      setTagInput('')
    }
    if (e.key === 'Backspace' && !tagInput && localTags.length > 0) {
      setLocalTags(localTags.slice(0, -1))
    }
  }

  const removeTag = (tag: string) => {
    setLocalTags(localTags.filter(t => t !== tag))
  }

  const handleTagsSave = async () => {
    await onUpdateTags(localTags)
    setEditingTags(false)
  }

  const handleTagsCancel = () => {
    setLocalTags(tags)
    setTagInput('')
    setEditingTags(false)
  }

  return (
    <div className="client-header" data-testid="client-detail-header">
      <div className="client-header-top">
        {editingName ? (
          <input
            ref={nameInputRef}
            className="client-header-name-input"
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            data-testid="client-name-input"
          />
        ) : (
          <h1
            className="client-header-name"
            onClick={() => setEditingName(true)}
            data-testid="client-detail-name"
          >
            {name}
          </h1>
        )}

        <div className="client-header-badges">
          <span className="client-type-badge" data-testid="client-type-badge">
            {type}
          </span>

          <div className="client-status-wrapper" ref={statusRef}>
            <button
              className={`status-badge ${statusClass}`}
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              data-testid="client-status-badge"
            >
              {status}
            </button>
            {statusDropdownOpen && (
              <div className="client-status-dropdown" data-testid="client-status-dropdown">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    className={`client-status-option ${s === status ? 'selected' : ''}`}
                    onClick={() => handleStatusSelect(s)}
                    data-testid="client-status-option"
                  >
                    <span className={`status-badge ${`status-${s.toLowerCase()}`}`}>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="client-header-meta">
        <div className="client-tags-area" data-testid="client-tags-container">
          {editingTags ? (
            <div className="client-tags-editor" data-testid="client-tags-editor">
              <div className="tag-input-wrapper">
                <div className="tag-input-tags">
                  {localTags.map(tag => (
                    <span key={tag} className="tag-input-chip" data-testid="client-tag-editor-chip">
                      {tag}
                      <button className="tag-input-remove" onClick={() => removeTag(tag)} data-testid="client-tag-remove">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    className="tag-input-field"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add tag..."
                    data-testid="client-tag-input"
                  />
                </div>
              </div>
              <div className="client-tags-editor-actions">
                <button className="btn-secondary" onClick={handleTagsCancel} data-testid="client-tags-cancel">Cancel</button>
                <button className="btn-primary" onClick={handleTagsSave} data-testid="client-tags-save">Save</button>
              </div>
            </div>
          ) : (
            <div className="client-tags-display" data-testid="client-tags-display">
              {tags.length > 0 ? (
                tags.map(tag => (
                  <span key={tag} className="tag-chip" data-testid="client-tag-chip">{tag}</span>
                ))
              ) : (
                <span className="client-no-tags">No tags</span>
              )}
              <button
                className="client-tags-edit-btn"
                onClick={() => setEditingTags(true)}
                data-testid="client-tags-edit-button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {source && (
          <span className="client-source-tag" data-testid="client-source-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            {source}
          </span>
        )}
      </div>
    </div>
  )
}
