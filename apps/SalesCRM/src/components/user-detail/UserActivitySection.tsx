import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'

interface UserActivity {
  id: string
  event_type: string
  description: string
  client_name: string | null
  client_id: string
  created_at: string
}

interface UserActivitySectionProps {
  activity: UserActivity[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatRelativeDate(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  return formatDate(dateStr)
}

export function UserActivitySection({ activity }: UserActivitySectionProps) {
  return (
    <div data-testid="user-activity-section" className="border border-border rounded-[6px] bg-surface">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Clock size={14} strokeWidth={1.75} className="text-text-muted" />
        <h2 className="text-[14px] font-semibold text-text-primary">Recent Activity</h2>
      </div>
      <div className="px-5 py-4">
        {activity.length === 0 ? (
          <p className="text-[13px] text-text-muted text-center py-4">No recent activity.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activity.map((event) => (
              <div key={event.id} data-testid={`user-activity-${event.id}`} className="flex items-start gap-3 max-sm:flex-col max-sm:gap-0.5">
                <div className="text-[12px] text-text-muted whitespace-nowrap mt-0.5">{formatRelativeDate(event.created_at)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text-primary">{event.description}</div>
                  {event.client_name && (
                    <Link to={`/clients/${event.client_id}`} className="text-[12px] text-accent hover:underline">
                      {event.client_name}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
