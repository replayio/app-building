import { useNavigate } from 'react-router-dom'
import type { Individual } from '../../store/slices/individualsSlice'

interface ContactsTableProps {
  contacts: Individual[]
}

export default function ContactsTable({ contacts }: ContactsTableProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="contacts-table">
      {/* Header row */}
      <div
        data-testid="contacts-table-header"
        className="grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1fr_1.2fr] h-9 items-center text-[12px] font-medium text-[var(--color-text-muted)] border-b border-[var(--color-bg-border)]"
      >
        <span className="px-3">Name</span>
        <span className="px-3">Title</span>
        <span className="px-3">Email</span>
        <span className="px-3">Phone</span>
        <span className="px-3">Location</span>
        <span className="px-3">Associated Clients</span>
      </div>

      {/* Data rows */}
      {contacts.map((contact) => (
        <div
          key={contact.id}
          data-testid="contacts-table-row"
          onClick={() => navigate(`/individuals/${contact.id}`)}
          className="grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1fr_1.2fr] h-11 items-center text-[13px] text-[var(--color-text-secondary)] border-b border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-100"
        >
          <span className="px-3 truncate font-medium text-[var(--color-text-primary)]">{contact.name}</span>
          <span className="px-3 truncate">{contact.title || '—'}</span>
          <span className="px-3 truncate">{contact.email || '—'}</span>
          <span className="px-3 truncate">{contact.phone || '—'}</span>
          <span className="px-3 truncate">{contact.location || '—'}</span>
          <span className="px-3 truncate">
            {contact.client_names && contact.client_names.length > 0
              ? contact.client_names.join(', ')
              : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
