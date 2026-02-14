import { useNavigate } from 'react-router-dom'
import { Users, User } from 'lucide-react'

interface DealContact {
  id: string
  individual_id: string
  individual_name: string
  title: string | null
  role: string
  company: string | null
}

interface DealContactsSectionProps {
  contacts: DealContact[]
}

export function DealContactsSection({ contacts }: DealContactsSectionProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="deal-contacts-section" className="border border-border rounded-[6px] p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} strokeWidth={1.75} className="text-text-muted" />
        <h2 className="text-[14px] font-semibold text-text-primary">Contacts/Individuals</h2>
      </div>

      {contacts.length === 0 ? (
        <div data-testid="deal-contacts-empty" className="text-[13px] text-text-muted py-2">No contacts linked to this deal</div>
      ) : (
        <div className="flex flex-col gap-1">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              data-testid={`deal-contact-${contact.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100"
            >
              <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center flex-shrink-0">
                <User size={14} strokeWidth={1.75} className="text-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-text-primary font-medium">
                  {contact.individual_name}
                </div>
                <div className="text-[12px] text-text-muted">
                  {contact.role && <span className="capitalize">({contact.role.replace('_', ' ')})</span>}
                  {contact.company && <span> · {contact.company}</span>}
                </div>
              </div>
              <button
                data-testid={`deal-contact-view-profile-${contact.id}`}
                onClick={() => navigate(`/individuals/${contact.individual_id}`)}
                className="text-[12px] text-accent hover:underline flex-shrink-0"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
