import { ArrowLeft, Mail, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { UserDetail } from '../../store/slices/usersSlice'
import { getInitials, formatDate } from '../../lib/utils'

interface UserDetailHeaderProps {
  user: UserDetail
}

export default function UserDetailHeader({ user }: UserDetailHeaderProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="user-detail-header" className="flex items-start gap-4 mb-6">
      {/* Back button */}
      <button
        data-testid="back-to-team-button"
        type="button"
        onClick={() => navigate('/users')}
        className="mt-1 h-7 w-7 rounded flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] cursor-pointer shrink-0"
      >
        <ArrowLeft size={16} />
      </button>

      {/* Avatar */}
      <div data-testid="user-avatar" className="shrink-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-lg font-medium">
            {getInitials(user.name)}
          </div>
        )}
      </div>

      {/* User info */}
      <div className="min-w-0 flex-1">
        <h1 data-testid="user-name" className="text-lg font-semibold text-[var(--color-text-primary)]">
          {user.name}
        </h1>
        <div className="flex flex-col gap-1 mt-1">
          <div data-testid="user-email" className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
            <Mail size={13} />
            <span>{user.email}</span>
          </div>
          <div data-testid="user-join-date" className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
            <Calendar size={13} />
            <span>Joined {formatDate(user.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
