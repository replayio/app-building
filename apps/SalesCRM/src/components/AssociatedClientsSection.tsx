import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface AssociatedClient {
  id: string
  name: string
  status: string
  industry: string | null
  role: string | null
}

interface AssociatedClientsSectionProps {
  individualId: string
}

export default function AssociatedClientsSection({ individualId }: AssociatedClientsSectionProps) {
  const navigate = useNavigate()
  const [clients, setClients] = useState<AssociatedClient[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/individuals/${individualId}/clients`)
      const data = await res.json()
      setClients(data.clients || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [individualId])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const formatStatus = (status: string) => {
    if (status === 'Active') return 'Active Client'
    return status
  }

  return (
    <div className="person-section" data-testid="associated-clients-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          {/* Test: Associated Clients section displays heading with icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h2 data-testid="associated-clients-heading">Associated Clients</h2>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : clients.length > 0 ? (
        /* Test: Associated Clients shows client cards with all details */
        <div className="associated-clients-grid" data-testid="associated-clients-list">
          {clients.map(client => (
            <div key={client.id} className="associated-client-card" data-testid="associated-client-card">
              <div className="associated-client-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 21a8 8 0 0 0-16 0"/>
                  <circle cx="10" cy="8" r="5"/>
                  <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>
                </svg>
              </div>
              <div className="associated-client-info">
                <div className="associated-client-name" data-testid="associated-client-name">{client.name}</div>
                {/* Test: Client card displays correct status for each client */}
                <div className="associated-client-detail">
                  <span className="associated-client-label">Status: </span>
                  <span>{formatStatus(client.status)}</span>
                </div>
                {/* Test: Client card displays correct industry for each client */}
                <div className="associated-client-detail">
                  <span className="associated-client-label">Industry: </span>
                  <span>{client.industry || 'N/A'}</span>
                </div>
              </div>
              {/* Test: View Client Detail Page button navigates to client detail page */}
              {/* Test: Each View Client Detail Page button navigates correctly */}
              <button
                className="btn-ghost associated-client-btn"
                data-testid="view-client-detail-button"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                View Client Detail Page
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Test: Associated Clients section shows empty state when no clients exist */
        <div className="person-section-empty" data-testid="associated-clients-empty">
          No associated clients
        </div>
      )}
    </div>
  )
}
