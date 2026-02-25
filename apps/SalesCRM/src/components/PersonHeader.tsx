import { useNavigate } from "react-router-dom";
import { type PersonDetail, type AssociatedClient } from "../personDetailSlice";

interface PersonHeaderProps {
  person: PersonDetail;
  associatedClients: AssociatedClient[];
}

export function PersonHeader({ person, associatedClients }: PersonHeaderProps) {
  const navigate = useNavigate();

  const clientNames = associatedClients.map((c) => c.name);
  const titleLine = [person.title, clientNames.length > 0 ? clientNames.join(" & ") : null]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="person-header" data-testid="person-header">
      <h1 className="person-header-name" data-testid="person-name">
        {person.name}
      </h1>

      {titleLine && (
        <div className="person-header-title" data-testid="person-title">
          {titleLine}
        </div>
      )}

      <div className="person-header-contact">
        {person.email && (
          <div className="person-header-contact-row" data-testid="person-email">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 5L8 9L14 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{person.email}</span>
          </div>
        )}

        {person.phone && (
          <div className="person-header-contact-row" data-testid="person-phone">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6.5 2.5H9.5C10.0523 2.5 10.5 2.94772 10.5 3.5V12.5C10.5 13.0523 10.0523 13.5 9.5 13.5H6.5C5.94772 13.5 5.5 13.0523 5.5 12.5V3.5C5.5 2.94772 5.94772 2.5 6.5 2.5Z" stroke="currentColor" strokeWidth="1.2" />
              <line x1="7.5" y1="11.5" x2="8.5" y2="11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span>{person.phone}</span>
          </div>
        )}

        {person.location && (
          <div className="person-header-contact-row" data-testid="person-location">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5C5.51472 1.5 3.5 3.51472 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.51472 10.4853 1.5 8 1.5Z" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span>{person.location}</span>
          </div>
        )}
      </div>

      {associatedClients.length > 0 && (
        <div className="person-header-clients" data-testid="person-associated-clients">
          <span className="person-header-clients-label">Associated Clients:</span>
          {associatedClients.map((client, index) => (
            <span key={client.id}>
              <button
                className="person-header-client-link"
                data-testid={`person-client-link-${client.id}`}
                onClick={() => navigate(`/clients/${client.id}`)}
                type="button"
              >
                {client.name}
              </button>
              {index < associatedClients.length - 1 && <span className="person-header-client-separator">, </span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
