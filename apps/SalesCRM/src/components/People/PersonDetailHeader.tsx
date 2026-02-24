import { useState } from 'react'
import { ArrowLeft, Pencil, Mail, Phone, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { IndividualDetail } from '../../store/slices/individualsSlice'
import EditPersonModal from './EditPersonModal'

interface PersonDetailHeaderProps {
  person: IndividualDetail
  onPersonUpdated: () => void
}

export default function PersonDetailHeader({ person, onPersonUpdated }: PersonDetailHeaderProps) {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  async function handleEditSubmit(data: {
    name: string
    title: string
    email: string
    phone: string
    location: string
  }) {
    const res = await fetch(`/.netlify/functions/individuals/${person.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update')
    onPersonUpdated()
  }

  const clientNames = person.clients?.map((c) => c.name) || []
  const titleLine = [person.title, clientNames.length > 0 ? clientNames.join(' & ') : null]
    .filter(Boolean)
    .join(' | ')

  return (
    <div data-testid="person-detail-header" className="mb-6">
      <div className="flex items-start gap-3">
        {/* Back button */}
        <button
          data-testid="back-to-contacts-button"
          type="button"
          onClick={() => navigate('/contacts')}
          className="mt-1 h-7 w-7 rounded flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] cursor-pointer shrink-0"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Person info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 data-testid="person-name" className="text-lg font-semibold text-[var(--color-text-primary)]">
              {person.name}
            </h1>
          </div>

          {/* Title and organization line */}
          {titleLine && (
            <p data-testid="person-title-line" className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
              {titleLine}
            </p>
          )}

          {/* Contact info row */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {person.email && (
              <div data-testid="person-email" className="flex items-center gap-1.5">
                <Mail size={13} className="text-[var(--color-text-muted)] shrink-0" />
                <a
                  href={`mailto:${person.email}`}
                  className="text-[12px] text-[var(--color-accent)] hover:underline"
                >
                  {person.email}
                </a>
              </div>
            )}
            {person.phone && (
              <div data-testid="person-phone" className="flex items-center gap-1.5">
                <Phone size={13} className="text-[var(--color-text-muted)] shrink-0" />
                <span className="text-[12px] text-[var(--color-text-primary)]">{person.phone}</span>
              </div>
            )}
            {person.location && (
              <div data-testid="person-location" className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[var(--color-text-muted)] shrink-0" />
                <span className="text-[12px] text-[var(--color-text-primary)]">{person.location}</span>
              </div>
            )}
          </div>

          {/* Associated clients row */}
          {person.clients && person.clients.length > 0 && (
            <div data-testid="person-associated-clients-links" className="flex flex-wrap items-center gap-1 mt-2">
              <span className="text-[12px] text-[var(--color-text-muted)]">Associated Clients:</span>
              {person.clients.map((client, idx) => (
                <span key={client.id}>
                  <button
                    type="button"
                    data-testid={`person-header-client-link-${client.id}`}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="text-[12px] text-[var(--color-accent)] hover:underline cursor-pointer"
                  >
                    {client.name}
                  </button>
                  {idx < person.clients.length - 1 && (
                    <span className="text-[12px] text-[var(--color-text-muted)]">, </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Edit button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            data-testid="edit-person-button"
            type="button"
            onClick={() => setEditOpen(true)}
            className="h-7 w-7 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-hover)] cursor-pointer"
          >
            <Pencil size={14} />
          </button>
        </div>
      </div>

      <EditPersonModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        person={person}
      />
    </div>
  )
}
