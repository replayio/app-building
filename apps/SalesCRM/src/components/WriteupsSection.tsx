import { useState, useEffect, useCallback } from 'react'

interface Writeup {
  id: string
  title: string
  content: string | null
  author: string | null
  version: number
  created_at: string
  updated_at: string
}

interface WriteupsSectionProps {
  dealId: string
}

export default function WriteupsSection({ dealId }: WriteupsSectionProps) {
  const [writeups, setWriteups] = useState<Writeup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingWriteup, setEditingWriteup] = useState<Writeup | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [versionHistory, setVersionHistory] = useState<Writeup | null>(null)
  const [toast, setToast] = useState('')

  const fetchWriteups = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/deals/${dealId}/writeups`)
      const data = await res.json()
      setWriteups(data.writeups || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchWriteups()
  }, [fetchWriteups])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/.netlify/functions/deals/${dealId}/writeups/${id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      fetchWriteups()
    } catch {
      // silently fail
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="person-section" data-testid="writeups-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <h2 data-testid="writeups-heading">Writeups</h2>
        </div>
        <div className="person-section-actions">
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
            data-testid="writeups-new-entry-button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            + New Entry
          </button>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : writeups.length > 0 ? (
        <div className="writeups-list" data-testid="writeups-list">
          {writeups.map(w => (
            <div key={w.id} className="writeup-entry" data-testid="writeup-entry">
              <div className="writeup-entry-header">
                <span className="writeup-title">{w.title}</span>
                <span className="writeup-meta"> - {formatDate(w.created_at)}</span>
                {w.author && <span className="writeup-author"> ({w.author})</span>}
              </div>
              {w.content && (
                <p className="writeup-content" data-testid="writeup-content">
                  {w.content.length > 120 ? w.content.slice(0, 120) + '...' : w.content}
                </p>
              )}
              <div className="writeup-actions">
                <button
                  className="btn-ghost"
                  onClick={() => setEditingWriteup(w)}
                  data-testid="writeup-edit-button"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  Edit
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => setVersionHistory(w)}
                  data-testid="writeup-version-history-button"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Version History
                </button>
                <button
                  className="btn-ghost btn-danger-text"
                  onClick={() => setDeleteConfirm(w.id)}
                  data-testid="writeup-delete-button"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="person-section-empty" data-testid="writeups-empty">
          No writeups yet
        </div>
      )}

      {showCreateForm && (
        <WriteupFormModal
          dealId={dealId}
          onClose={() => setShowCreateForm(false)}
          onSaved={() => { setShowCreateForm(false); fetchWriteups(); showToast('Writeup created successfully') }}
        />
      )}

      {editingWriteup && (
        <WriteupFormModal
          dealId={dealId}
          writeup={editingWriteup}
          onClose={() => setEditingWriteup(null)}
          onSaved={() => { setEditingWriteup(null); fetchWriteups(); showToast('Writeup updated successfully') }}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" data-testid="writeup-delete-confirm">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Delete Writeup</h3>
            </div>
            <p style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete this writeup?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} data-testid="writeup-delete-cancel">Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)} data-testid="writeup-delete-confirm-button">Delete</button>
            </div>
          </div>
        </div>
      )}

      {versionHistory && (
        <VersionHistoryModal
          writeup={versionHistory}
          onClose={() => setVersionHistory(null)}
        />
      )}

      {toast && <div className="success-toast" data-testid="writeup-toast">{toast}</div>}
    </div>
  )
}

interface WriteupFormModalProps {
  dealId: string
  writeup?: Writeup
  onClose: () => void
  onSaved: () => void
}

function WriteupFormModal({ dealId, writeup, onClose, onSaved }: WriteupFormModalProps) {
  const isEditing = !!writeup
  const [title, setTitle] = useState(writeup?.title || '')
  const [content, setContent] = useState(writeup?.content || '')
  const [author, setAuthor] = useState(writeup?.author || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const url = isEditing
        ? `/.netlify/functions/deals/${dealId}/writeups/${writeup!.id}`
        : `/.netlify/functions/deals/${dealId}/writeups`

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), author: author.trim() || null }),
      })
      if (res.ok) {
        onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" data-testid="writeup-form-modal">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Edit Writeup' : 'New Writeup Entry'}</h3>
          <button className="modal-close" onClick={onClose} data-testid="writeup-form-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-form">
          <div className="form-field">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors({}) }}
              placeholder="Enter writeup title..."
              data-testid="writeup-title-input"
            />
            {errors.title && <span className="form-error" data-testid="writeup-title-error">{errors.title}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">Content</label>
            <textarea
              className="form-input form-textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter writeup content..."
              rows={5}
              data-testid="writeup-content-input"
            />
          </div>

          {!isEditing && (
            <div className="form-field">
              <label className="form-label">Author</label>
              <input
                type="text"
                className="form-input"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="e.g. Sarah Lee"
                data-testid="writeup-author-input"
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="writeup-form-cancel">Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving} data-testid="writeup-form-save">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface VersionHistoryModalProps {
  writeup: Writeup
  onClose: () => void
}

function VersionHistoryModal({ writeup, onClose }: VersionHistoryModalProps) {
  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  }

  return (
    <div className="modal-overlay" data-testid="writeup-version-history-modal">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Version History - {writeup.title}</h3>
          <button className="modal-close" onClick={onClose} data-testid="version-history-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div style={{ padding: '16px' }}>
          <div className="writeup-version-entry" data-testid="writeup-version-entry">
            <div className="writeup-version-header">
              <span className="writeup-version-label">Version {writeup.version}</span>
              <span className="writeup-version-date">{formatFullDate(writeup.updated_at)}</span>
            </div>
            <p className="writeup-version-content">{writeup.content || 'No content'}</p>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="version-history-close-btn">Close</button>
        </div>
      </div>
    </div>
  )
}
