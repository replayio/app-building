import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Calendar } from 'lucide-react'

interface UserDetailHeaderProps {
  user: {
    name: string
    email: string
    avatar_url: string
    created_at: string
  }
  activeDealsCount: number
  openTasksCount: number
  totalDealsCount: number
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function UserDetailHeader({ user, activeDealsCount, openTasksCount, totalDealsCount }: UserDetailHeaderProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="user-detail-header" className="mb-6">
      <button
        data-testid="user-detail-back"
        onClick={() => navigate('/users')}
        className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors duration-100 mb-4"
      >
        <ArrowLeft size={14} strokeWidth={1.75} />
        Back to Team Members
      </button>

      <div className="flex items-center gap-4">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.name} className="w-14 h-14 rounded-full" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-[20px] font-medium text-accent">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 data-testid="user-detail-name" className="text-[22px] font-semibold text-text-primary">
            {user.name}
          </h1>
          <div className="flex items-center gap-4 text-[13px] text-text-muted mt-1">
            <span className="flex items-center gap-1.5">
              <Mail size={13} strokeWidth={1.75} />
              {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} strokeWidth={1.75} />
              Joined {formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-5">
        <div className="border border-border rounded-[6px] bg-surface p-3">
          <div className="text-[12px] text-text-muted mb-1">Active Deals</div>
          <div className="text-[18px] font-semibold text-text-primary">{activeDealsCount}</div>
        </div>
        <div className="border border-border rounded-[6px] bg-surface p-3">
          <div className="text-[12px] text-text-muted mb-1">Open Tasks</div>
          <div className="text-[18px] font-semibold text-text-primary">{openTasksCount}</div>
        </div>
        <div className="border border-border rounded-[6px] bg-surface p-3">
          <div className="text-[12px] text-text-muted mb-1">Total Deals</div>
          <div className="text-[18px] font-semibold text-text-primary">{totalDealsCount}</div>
        </div>
      </div>
    </div>
  )
}
