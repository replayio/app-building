import { useNavigate } from 'react-router-dom'

interface AssociatedClient {
  client_id: string
  client_name: string
  role: string
  is_primary: boolean
}

interface PersonHeaderProps {
  name: string
  title: string | null
  email: string | null
  phone: string | null
  location: string | null
  associatedClients: AssociatedClient[]
}

export default function PersonHeader({ name, title, email, phone, location, associatedClients }: PersonHeaderProps) {
  const navigate = useNavigate()

  const clientNames = associatedClients.map(c => c.client_name).join(' & ')

  return (
    <div className="person-header" data-testid="person-header">
      {/* Test: Header displays person's full name prominently */}
      <h1 className="person-name" data-testid="person-name">{name}</h1>

      {/* Test: Header displays title and client associations */}
      {(title || clientNames) && (
        <div className="person-title-row" data-testid="person-title">
          {title && <span className="person-title-text">{title}</span>}
          {title && clientNames && <span className="person-title-separator"> | </span>}
          {clientNames && <span className="person-title-clients">{clientNames}</span>}
        </div>
      )}

      <div className="person-contact-info">
        {/* Test: Header displays email with mail icon */}
        {email && (
          <div className="person-contact-item" data-testid="person-email">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <span>{email}</span>
          </div>
        )}

        {/* Test: Header displays phone number with phone icon */}
        {phone && (
          <div className="person-contact-item" data-testid="person-phone">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>{phone}</span>
          </div>
        )}

        {/* Test: Header displays location with location pin icon */}
        {location && (
          <div className="person-contact-item" data-testid="person-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* Test: Header displays associated clients as clickable links */}
      {/* Test: Associated client link navigates to client detail page */}
      {/* Test: Each associated client link navigates correctly */}
      {associatedClients.length > 0 && (
        <div className="person-associated-clients" data-testid="person-associated-clients">
          <span className="person-associated-label">Associated Clients:</span>
          {associatedClients.map((client, index) => (
            <span key={client.client_id}>
              <button
                className="person-client-link"
                data-testid="associated-client-link"
                onClick={() => navigate(`/clients/${client.client_id}`)}
              >
                {client.client_name}
              </button>
              {index < associatedClients.length - 1 && <span>, </span>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
