import { useState, useEffect, useCallback } from 'react'

interface ContactEntry {
  id: string
  interaction_type: string
  summary: string
  team_member: string | null
  contact_date: string
  created_at: string
}

interface ContactHistorySectionProps {
  individualId: string
}

const INTERACTION_TYPES = ['Video Call', 'Email', 'Meeting (In-person)', 'Note']

export default function ContactHistorySection({ individualId }: ContactHistorySectionProps) {
  const [entries, setEntries] = useState<ContactEntry[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ContactEntry | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/individuals/${individualId}/contact-history`)
      const data = await res.json()
      setEntries(data.entries || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [individualId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const filteredEntries = filterType
    ? entries.filter(e => e.interaction_type === filterType)
    : entries

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    })
  }

  return (
    <div className="person-section" data-testid="contact-history-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          {/* Test: Contact History section displays heading with icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <h2 data-testid="contact-history-heading">History of Contact</h2>
        </div>
        <div className="person-section-actions">
          {/* Test: Filter button is displayed in Contact History section */}
          {/* Test: Filter button opens filter options for contact history */}
          <div className="filter-dropdown-wrapper">
            <button
              className="btn-ghost"
              data-testid="contact-history-filter-button"
              onClick={() => setShowFilter(!showFilter)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
            </button>
            {showFilter && (
              <div className="filter-dropdown-menu" data-testid="contact-history-filter-menu">
                <button
                  className={`filter-dropdown-option ${filterType === '' ? 'selected' : ''}`}
                  onClick={() => { setFilterType(''); setShowFilter(false) }}
                >
                  All Types
                </button>
                {INTERACTION_TYPES.map(type => (
                  <button
                    key={type}
                    className={`filter-dropdown-option ${filterType === type ? 'selected' : ''}`}
                    onClick={() => { setFilterType(type); setShowFilter(false) }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Test: Add Entry button is displayed in Contact History section */}
          {/* Test: Add Entry button opens contact history creation form */}
          <button
            className="btn-primary"
            data-testid="contact-history-add-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add Entry
          </button>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : filteredEntries.length > 0 ? (
        /* Test: Contact History shows chronological log entries */
        <div className="contact-history-list" data-testid="contact-history-list">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="contact-history-entry" data-testid="contact-history-entry">
              <div className="contact-history-entry-header">
                {/* Test: Contact History displays various interaction types */}
                <span className="contact-history-date">{formatDate(entry.contact_date)}</span>
                <span className="contact-history-separator"> | </span>
                <span className="contact-history-type">{entry.interaction_type}</span>
              </div>
              <div className="contact-history-body">
                <span className="contact-history-label">Summary: </span>
                <span className="contact-history-summary">{entry.summary}</span>
              </div>
              {/* Test: Contact History entries show team member with role */}
              {entry.team_member && (
                <div className="contact-history-team">
                  <span className="contact-history-label">Team Member: </span>
                  <span>{entry.team_member}</span>
                </div>
              )}
              {/* Test: Contact History entry edit icon opens edit form */}
              <button
                className="contact-history-edit-btn"
                data-testid="contact-history-edit-button"
                onClick={() => setEditingEntry(entry)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Test: Contact History section shows empty state when no history exists */
        <div className="person-section-empty" data-testid="contact-history-empty">
          No contact history yet
        </div>
      )}

      {/* Test: Add Entry button opens contact history creation form */}
      {/* Test: New contact history entry can be created successfully */}
      {/* Test: Add Entry form validates required fields */}
      {/* Test: Add Entry form can be cancelled */}
      {showAddForm && (
        <ContactHistoryFormModal
          individualId={individualId}
          onClose={() => setShowAddForm(false)}
          onSaved={() => { setShowAddForm(false); fetchHistory() }}
        />
      )}

      {/* Test: Contact History entry edit icon opens edit form */}
      {/* Test: Contact History entry edit saves changes */}
      {/* Test: Contact History entry edit can be cancelled */}
      {editingEntry && (
        <ContactHistoryFormModal
          individualId={individualId}
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={() => { setEditingEntry(null); fetchHistory() }}
        />
      )}
    </div>
  )
}

interface ContactHistoryFormModalProps {
  individualId: string
  entry?: ContactEntry
  onClose: () => void
  onSaved: () => void
}

function ContactHistoryFormModal({ individualId, entry, onClose, onSaved }: ContactHistoryFormModalProps) {
  const isEditing = !!entry
  const [interactionType, setInteractionType] = useState(entry?.interaction_type || '')
  const [summary, setSummary] = useState(entry?.summary || '')
  const [teamMember, setTeamMember] = useState(entry?.team_member || '')
  const [contactDate, setContactDate] = useState(
    entry?.contact_date ? new Date(entry.contact_date).toISOString().slice(0, 16) : ''
  )
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!interactionType) newErrors.type = 'Interaction type is required'
    if (!summary) newErrors.summary = 'Summary is required'
    if (!contactDate) newErrors.date = 'Date/time is required'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const url = isEditing
        ? `/.netlify/functions/individuals/${individualId}/contact-history/${entry!.id}`
        : `/.netlify/functions/individuals/${individualId}/contact-history`

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_type: interactionType,
          summary,
          team_member: teamMember || null,
          contact_date: contactDate || null,
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
    <div className="modal-overlay" data-testid="contact-history-form-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Edit Contact History' : 'Add Contact History Entry'}</h3>
          <button className="modal-close" onClick={onClose} data-testid="contact-history-form-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-form">
          <div className="form-field">
            <label className="form-label">Date/Time *</label>
            <input
              type="datetime-local"
              className={`form-input ${errors.date ? 'error' : ''}`}
              value={contactDate}
              onChange={e => setContactDate(e.target.value)}
              data-testid="contact-history-date-input"
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">Interaction Type *</label>
            <div className="form-dropdown-wrapper">
              <button
                className="form-dropdown-trigger"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                data-testid="contact-history-type-dropdown"
              >
                <span>{interactionType || 'Select type...'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {showTypeDropdown && (
                <div className="form-dropdown-menu">
                  {INTERACTION_TYPES.map(type => (
                    <button
                      key={type}
                      className={`form-dropdown-option ${interactionType === type ? 'selected' : ''}`}
                      onClick={() => { setInteractionType(type); setShowTypeDropdown(false) }}
                      data-testid="contact-history-type-option"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.type && <span className="form-error">{errors.type}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">Summary *</label>
            <textarea
              className={`form-input form-textarea ${errors.summary ? 'error' : ''}`}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Enter summary..."
              rows={3}
              data-testid="contact-history-summary-input"
            />
            {errors.summary && <span className="form-error">{errors.summary}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">Team Member</label>
            <input
              type="text"
              className="form-input"
              value={teamMember}
              onChange={e => setTeamMember(e.target.value)}
              placeholder="e.g. Michael B. (Sales Lead)"
              data-testid="contact-history-team-input"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="contact-history-form-cancel">Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving} data-testid="contact-history-form-save">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
