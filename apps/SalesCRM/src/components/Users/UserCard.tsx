import { Mail, Briefcase, CheckSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { User } from '../../store/slices/usersSlice'
import { getInitials } from '../../lib/utils'

interface UserCardProps {
  user: User
}

export default function UserCard({ user }: UserCardProps) {
  const navigate = useNavigate()

  return (
    <div
      data-testid={`user-card-${user.id}`}
      onClick={() => navigate(`/users/${user.id}`)}
      className="rounded-lg border border-[var(--color-bg-border)] p-4 hover:bg-[var(--color-hover)] cursor-pointer flex flex-col items-center text-center"
    >
      {/* Avatar */}
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-14 h-14 rounded-full object-cover mb-3"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-lg font-medium mb-3">
          {getInitials(user.name)}
        </div>
      )}

      {/* Name */}
      <div data-testid="user-card-name" className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-1">
        {user.name}
      </div>

      {/* Email */}
      <div data-testid="user-card-email" className="flex items-center gap-1 text-[12px] text-[var(--color-text-muted)] mb-3 max-w-full">
        <Mail size={12} className="shrink-0" />
        <span className="truncate">{user.email}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[12px] text-[var(--color-text-muted)]">
        <div data-testid="user-card-deals" className="flex items-center gap-1">
          <Briefcase size={12} />
          <span>{user.active_deals_count} active deal{user.active_deals_count !== 1 ? 's' : ''}</span>
        </div>
        <div data-testid="user-card-tasks" className="flex items-center gap-1">
          <CheckSquare size={12} />
          <span>{user.open_tasks_count} open task{user.open_tasks_count !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}
