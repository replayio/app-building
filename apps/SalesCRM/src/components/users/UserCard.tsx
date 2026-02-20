import { useNavigate } from 'react-router-dom'
import { Briefcase, CheckSquare, Mail } from 'lucide-react'

interface UserCardProps {
  id: string
  name: string
  email: string
  avatar_url: string
  active_deals_count: number
  open_tasks_count: number
}

export function UserCard({ id, name, email, avatar_url, active_deals_count, open_tasks_count }: UserCardProps) {
  const navigate = useNavigate()

  return (
    <div
      data-testid={`user-card-${id}`}
      onClick={() => navigate(`/users/${id}`)}
      className="border border-border rounded-[6px] bg-surface p-4 cursor-pointer hover:border-accent/40 transition-colors duration-100"
    >
      <div className="flex items-center gap-3 mb-3">
        {avatar_url ? (
          <img
            src={avatar_url}
            alt={name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-[15px] font-medium text-accent">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div data-testid={`user-name-${id}`} className="text-[13px] font-medium text-text-primary truncate">
            {name}
          </div>
          <div className="flex items-center gap-1 text-[12px] text-text-muted truncate">
            <Mail size={11} strokeWidth={1.75} />
            {email}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Briefcase size={12} strokeWidth={1.75} />
          <span>{active_deals_count} active deal{active_deals_count !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckSquare size={12} strokeWidth={1.75} />
          <span>{open_tasks_count} open task{open_tasks_count !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}
