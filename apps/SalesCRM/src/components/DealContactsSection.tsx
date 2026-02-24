import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface DealContact {
  id: string
  name: string
  title: string | null
  email: string | null
  role: string | null
  client_name: string | null
}

interface DealContactsSectionProps {
  dealId: string
}

export default function DealContactsSection({ dealId }: DealContactsSectionProps) {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<DealContact[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState<DealContact | null>(null)

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/deals/${dealId}/contacts`)
      const data = await res.json()
      setContacts(data.contacts || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const removeContact = async (contact: DealContact) => {
    try {
      await fetch(`/.netlify/functions/deals/${dealId}/contacts/${contact.id}`, { method: 'DELETE' })
      setRemoveConfirm(null)
      fetchContacts()
    } catch {
      // silently fail
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="person-section" data-testid="deal-contacts-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h2 data-testid="deal-contacts-heading">Contacts/Individuals</h2>
        </div>
        <div className="person-section-actions">
          <button
            className="btn-primary"
            onClick={() => setShowAddDialog(true)}
            data-testid="deal-contacts-add-button"
          >
            Add Contact
          </button>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : contacts.length > 0 ? (
        <div className="deal-contacts-list" data-testid="deal-contacts-list">
          {contacts.map(contact => (
            <div key={contact.id} className="deal-contact-entry" data-testid="deal-contact-entry">
              <div className="deal-contact-avatar" data-testid="deal-contact-avatar">
                {getInitials(contact.name)}
              </div>
              <div className="deal-contact-info">
                <span className="deal-contact-name">{contact.name}</span>
                <span className="deal-contact-meta">
                  {contact.role && <span> ({contact.role}</span>}
                  {contact.role && contact.client_name && <span>, </span>}
                  {!contact.role && contact.client_name && <span> (</span>}
                  {contact.client_name && <span>{contact.client_name}</span>}
                  {(contact.role || contact.client_name) && <span>)</span>}
                </span>
              </div>
              <div className="deal-contact-actions">
                <button
                  className="deal-contact-view-link"
                  onClick={() => navigate(`/individuals/${contact.id}`)}
                  data-testid="deal-contact-view-profile"
                >
                  View Profile
                </button>
                <button
                  className="btn-ghost deal-contact-remove"
                  onClick={() => setRemoveConfirm(contact)}
                  data-testid="deal-contact-remove-button"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="person-section-empty" data-testid="deal-contacts-empty">
          No contacts linked to this deal
        </div>
      )}

      {showAddDialog && (
        <AddContactDialog
          dealId={dealId}
          existingContactIds={contacts.map(c => c.id)}
          onClose={() => setShowAddDialog(false)}
          onSaved={() => { setShowAddDialog(false); fetchContacts() }}
        />
      )}

      {removeConfirm && (
        <div className="modal-overlay" data-testid="deal-contact-remove-confirm">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Remove Contact</h3>
            </div>
            <p style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Remove {removeConfirm.name} from this deal?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setRemoveConfirm(null)} data-testid="deal-contact-remove-cancel">Cancel</button>
              <button className="btn-danger" onClick={() => removeContact(removeConfirm)} data-testid="deal-contact-remove-confirm-button">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AddContactDialogProps {
  dealId: string
  existingContactIds: string[]
  onClose: () => void
  onSaved: () => void
}

interface SearchResult {
  id: string
  name: string
  title: string | null
  email: string | null
}

function AddContactDialog({ dealId, existingContactIds, onClose, onSaved }: AddContactDialogProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setResults([])
        return
      }
      setSearching(true)
      try {
        const res = await fetch(`/.netlify/functions/individuals?search=${encodeURIComponent(search)}`)
        const data = await res.json()
        const filtered = (data.individuals || []).filter(
          (i: SearchResult) => !existingContactIds.includes(i.id)
        )
        setResults(filtered)
      } catch {
        // silently fail
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, existingContactIds])

  const addContact = async (individual: SearchResult) => {
    setSaving(true)
    try {
      const res = await fetch(`/.netlify/functions/deals/${dealId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ individual_id: individual.id }),
      })
      if (res.ok) {
        onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" data-testid="add-contact-dialog">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Contact</h3>
          <button className="modal-close" onClick={onClose} data-testid="add-contact-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-form">
          <div className="form-field">
            <label className="form-label">Search Individuals</label>
            <div className="searchable-select-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="searchable-select-icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="searchable-select-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Type a name to search..."
                autoFocus
                data-testid="add-contact-search-input"
              />
            </div>
          </div>

          <div className="searchable-select-options" data-testid="add-contact-results">
            {searching ? (
              <div className="searchable-select-empty">Searching...</div>
            ) : results.length > 0 ? (
              results.map(person => (
                <button
                  key={person.id}
                  className="deal-contact-search-result"
                  onClick={() => addContact(person)}
                  disabled={saving}
                  data-testid="add-contact-result"
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
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="add-contact-cancel">Cancel</button>
        </div>
      </div>
    </div>
  )
}
