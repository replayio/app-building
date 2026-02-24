import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface ClientPerson {
  id: string
  name: string
  title: string | null
  email: string | null
  role: string | null
  is_primary: boolean
}

interface ClientPeopleSectionProps {
  clientId: string
  refreshKey?: number
}

export default function ClientPeopleSection({ clientId, refreshKey }: ClientPeopleSectionProps) {
  const navigate = useNavigate()
  const [people, setPeople] = useState<ClientPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [removeConfirm, setRemoveConfirm] = useState<ClientPerson | null>(null)

  const fetchPeople = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}/people`)
      const data = await res.json()
      setPeople(data.people || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchPeople()
  }, [fetchPeople, refreshKey])

  const removePerson = async (person: ClientPerson) => {
    try {
      await fetch(`/.netlify/functions/clients/${clientId}/people/${person.id}`, { method: 'DELETE' })
      setRemoveConfirm(null)
      fetchPeople()
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
    <div className="person-section" data-testid="people-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h2 data-testid="people-heading">People</h2>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : people.length > 0 ? (
        <div className="deal-contacts-list" data-testid="people-list">
          {people.map(person => (
            <div key={person.id} className="deal-contact-entry" data-testid="person-item">
              <div className="deal-contact-avatar" data-testid="person-avatar">
                {getInitials(person.name)}
              </div>
              <div className="deal-contact-info">
                <button
                  className="client-person-name-btn"
                  onClick={() => navigate(`/individuals/${person.id}`)}
                  data-testid="person-name"
                >
                  {person.name}
                </button>
                {person.role && (
                  <span className="deal-contact-meta" data-testid="person-role"> - {person.role}</span>
                )}
                {person.title && !person.role && (
                  <span className="deal-contact-meta" data-testid="person-role"> - {person.title}</span>
                )}
              </div>
              <div className="deal-contact-actions">
                <button
                  className="btn-ghost deal-contact-remove"
                  onClick={(e) => { e.stopPropagation(); setRemoveConfirm(person) }}
                  data-testid="person-remove-button"
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
        <div className="person-section-empty" data-testid="people-empty">
          No people associated with this client
        </div>
      )}

      {removeConfirm && (
        <div className="modal-overlay" data-testid="person-remove-confirmation">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Remove Person</h3>
            </div>
            <p style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Remove {removeConfirm.name} from this client?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setRemoveConfirm(null)} data-testid="person-remove-cancel">Cancel</button>
              <button className="btn-danger" onClick={() => removePerson(removeConfirm)} data-testid="person-remove-confirm">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
