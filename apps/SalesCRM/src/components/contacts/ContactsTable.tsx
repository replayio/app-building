import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import type { ContactListItem } from '../../types'

interface ContactsTableProps {
  contacts: ContactListItem[]
}

const gridClass = 'contacts-table-grid grid grid-cols-[1.2fr_1fr_1.2fr_0.8fr_0.8fr_1.2fr]'

export function ContactsTable({ contacts }: ContactsTableProps) {
  const navigate = useNavigate()

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-[13px]" data-testid="contacts-empty">
        No contacts found.
      </div>
    )
  }

  return (
    <div data-testid="contacts-table" className="w-full">
      {/* Header */}
      <div data-testid="contacts-table-header" className={`${gridClass} items-center h-[36px] px-4 text-[12px] font-medium text-text-muted border-b border-border`}>
        <span>Name</span>
        <span>Title</span>
        <span>Email</span>
        <span>Phone</span>
        <span>Location</span>
        <span>Associated Clients</span>
      </div>

      {/* Rows */}
      {contacts.map((contact) => (
        <div
          key={contact.id}
          data-testid={`contact-row-${contact.id}`}
          onClick={() => navigate(`/individuals/${contact.id}`)}
          className={`${gridClass} items-center h-[44px] px-4 cursor-pointer hover:bg-hover transition-colors duration-100 border-b border-border/50`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <User size={13} strokeWidth={1.75} className="text-accent" />
            </div>
            <span data-testid="contact-name" className="text-[13px] font-medium text-text-primary truncate">
              {contact.name}
            </span>
          </div>
          <span data-testid="contact-title" className="text-[13px] text-text-secondary truncate pr-2">
            {contact.title || '—'}
          </span>
          <span data-testid="contact-email" className="text-[13px] text-text-secondary truncate pr-2">
            {contact.email || '—'}
          </span>
          <span data-testid="contact-phone" className="text-[13px] text-text-secondary truncate pr-2">
            {contact.phone || '—'}
          </span>
          <span data-testid="contact-location" className="text-[13px] text-text-secondary truncate pr-2">
            {contact.location || '—'}
          </span>
          <div data-testid="contact-clients" className="flex items-center gap-1 overflow-hidden">
            {contact.associated_clients.length === 0 ? (
              <span className="text-[13px] text-text-muted">—</span>
            ) : (
              contact.associated_clients.map((ac) => (
                <span
                  key={ac.client_id}
                  className="inline-flex items-center h-[20px] px-1.5 text-[11px] font-medium text-text-secondary bg-surface-raised rounded-[3px] truncate"
                >
                  {ac.client_name}
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
