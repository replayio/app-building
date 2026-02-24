import { useNavigate } from 'react-router-dom'
import type { ClientPerson } from '../../store/slices/clientsSlice'
import { getInitials } from '../../lib/utils'

interface ClientPeopleProps {
  people: ClientPerson[]
}

export default function ClientPeople({ people }: ClientPeopleProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="client-people" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)]">People</h2>
      </div>

      {people.length === 0 ? (
        <div data-testid="client-people-empty" className="rounded-lg border border-[var(--color-bg-border)] p-6 text-center">
          <p className="text-[13px] text-[var(--color-text-muted)]">No contacts</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-bg-border)] divide-y divide-[var(--color-bg-border)]">
          {people.map((person) => (
            <button
              key={person.id}
              data-testid={`person-row-${person.id}`}
              type="button"
              onClick={() => navigate(`/individuals/${person.id}`)}
              className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-100 text-left"
            >
              {/* Avatar */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-[11px] font-medium">
                {getInitials(person.name)}
              </div>

              {/* Name and title */}
              <div className="min-w-0 flex-1">
                <span className="text-[13px] text-[var(--color-text-primary)]">
                  {person.name}
                  {person.title && (
                    <span className="text-[var(--color-text-muted)]"> - {person.title}</span>
                  )}
                </span>
              </div>

              {/* Primary indicator */}
              {person.is_primary && (
                <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-accent)] text-white">
                  Primary
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
