import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight } from 'lucide-react'
import type { ClientAssociation, ClientStatus } from '../../types'

interface AssociatedClientsSectionProps {
  associations: ClientAssociation[]
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Active Client',
  inactive: 'Inactive',
  prospect: 'Prospect',
  churned: 'Churned',
}

const STATUS_COLORS: Record<ClientStatus, string> = {
  active: 'bg-status-active/10 text-status-active',
  inactive: 'bg-status-inactive/10 text-status-inactive',
  prospect: 'bg-status-prospect/10 text-status-prospect',
  churned: 'bg-status-churned/10 text-status-churned',
}

export function AssociatedClientsSection({ associations }: AssociatedClientsSectionProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="associated-clients-section" className="border border-border rounded-[6px] p-4 mb-4">
      <h2 className="text-[14px] font-semibold text-text-primary mb-3">Associated Clients</h2>

      {associations.length === 0 ? (
        <div data-testid="associated-clients-empty-state" className="text-[13px] text-text-muted py-2">No associated clients</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {associations.map((assoc) => (
            <div
              key={assoc.client_id}
              data-testid={`associated-client-card-${assoc.client_id}`}
              className="border border-border rounded-[6px] p-4 hover:border-accent/40 transition-colors duration-100"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-[6px] bg-border/30 flex items-center justify-center text-text-muted">
                  <Building2 size={18} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div data-testid={`associated-client-name-${assoc.client_id}`} className="text-[13px] font-medium text-text-primary truncate">{assoc.client_name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span data-testid={`associated-client-status-${assoc.client_id}`} className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-[3px] ${STATUS_COLORS[assoc.client_status]}`}>
                      Status: {STATUS_LABELS[assoc.client_status]}
                    </span>
                  </div>
                  {assoc.industry && (
                    <div data-testid={`associated-client-industry-${assoc.client_id}`} className="text-[12px] text-text-muted mt-1">
                      Industry: {assoc.industry}
                    </div>
                  )}
                </div>
              </div>
              <button
                data-testid={`associated-client-view-button-${assoc.client_id}`}
                onClick={() => navigate(`/clients/${assoc.client_id}`)}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline cursor-pointer"
              >
                View Client Detail Page
                <ArrowRight size={12} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
