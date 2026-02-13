import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'

interface Person {
  id: string
  name: string
  title: string | null
  role: string | null
  is_primary: boolean
}

interface PeopleSectionProps {
  people: Person[]
}

export function PeopleSection({ people }: PeopleSectionProps) {
  const navigate = useNavigate()

  return (
    <div className="border border-border rounded-[6px] p-4 mb-4">
      <h2 className="text-[14px] font-semibold text-text-primary mb-3">People</h2>

      {people.length === 0 ? (
        <div className="text-[13px] text-text-muted py-2">No people associated</div>
      ) : (
        <div className="flex flex-col gap-1">
          {people.map((person) => (
            <div
              key={person.id}
              onClick={() => navigate(`/individuals/${person.id}`)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100 cursor-pointer"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-border/50 flex items-center justify-center text-text-muted">
                <User size={16} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-text-primary font-medium">{person.name}</span>
                {(person.role || person.title) && (
                  <span className="text-[13px] text-text-muted ml-1">
                    - {person.role || person.title}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
