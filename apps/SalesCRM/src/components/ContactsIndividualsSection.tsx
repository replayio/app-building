import { useNavigate } from "react-router-dom";
import type { DealIndividual } from "../dealDetailSlice";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ContactsIndividualsSectionProps {
  individuals: DealIndividual[];
  clientName: string | null;
}

export function ContactsIndividualsSection({ individuals, clientName }: ContactsIndividualsSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="detail-section" data-testid="contacts-individuals-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">Contacts/Individuals</h3>
      </div>
      <div className="detail-section-body">
        {individuals.length === 0 ? (
          <div className="detail-section-empty" data-testid="contacts-individuals-empty">
            No contacts associated
          </div>
        ) : (
          <div className="contacts-individuals-list" data-testid="contacts-individuals-list">
            {individuals.map((person) => (
              <div key={person.id} className="contacts-individual-row" data-testid={`contact-individual-${person.id}`}>
                <div className="person-avatar" data-testid={`contact-avatar-${person.id}`}>
                  {getInitials(person.name)}
                </div>
                <div className="contacts-individual-info">
                  <strong className="contacts-individual-name" data-testid={`contact-name-${person.id}`}>
                    {person.name}
                  </strong>
                  <span className="contacts-individual-role" data-testid={`contact-role-${person.id}`}>
                    ({person.role || "Contact"}{clientName ? `, ${clientName}` : ""})
                  </span>
                </div>
                <button
                  className="contacts-individual-view-btn"
                  data-testid={`contact-view-profile-${person.id}`}
                  onClick={() => navigate(`/individuals/${person.id}`)}
                  type="button"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
