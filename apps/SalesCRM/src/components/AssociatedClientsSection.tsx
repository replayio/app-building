import { useNavigate } from "react-router-dom";
import { type AssociatedClient } from "../personDetailSlice";

interface AssociatedClientsSectionProps {
  clients: AssociatedClient[];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatStatus(status: string): string {
  if (status === "active") return "Active Client";
  if (status === "prospect") return "Prospect";
  return capitalize(status);
}

export function AssociatedClientsSection({ clients }: AssociatedClientsSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="detail-section" data-testid="associated-clients-section">
      <div className="detail-section-header">
        <div className="detail-section-header-left">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="section-icon">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 6H14" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6 6V14" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <h3 className="detail-section-title">Associated Clients</h3>
        </div>
      </div>
      <div className="detail-section-body">
        {clients.length === 0 ? (
          <p className="detail-section-empty" data-testid="associated-clients-empty">
            No associated clients
          </p>
        ) : (
          <div className="associated-clients-grid" data-testid="associated-clients-list">
            {clients.map((client) => (
              <div key={client.id} className="associated-client-card" data-testid="associated-client-card">
                <div className="associated-client-header">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="associated-client-icon">
                    <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 3V1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M11 3V1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span className="associated-client-name" data-testid="associated-client-name">
                    {client.name}
                  </span>
                </div>
                <div className="associated-client-details">
                  <div className="associated-client-field" data-testid="associated-client-status">
                    <span className="associated-client-field-label">Status:</span>{" "}
                    <span className="associated-client-field-value">{formatStatus(client.status)}</span>
                  </div>
                  {client.industry && (
                    <div className="associated-client-field" data-testid="associated-client-industry">
                      <span className="associated-client-field-label">Industry:</span>{" "}
                      <span className="associated-client-field-value">{client.industry}</span>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn--secondary associated-client-view-btn"
                  data-testid={`view-client-${client.id}`}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  type="button"
                >
                  <span>View Client Detail Page</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5.5 2.5H11.5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M11.5 2.5L2.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
