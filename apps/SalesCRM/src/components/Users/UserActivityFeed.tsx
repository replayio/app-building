import { Briefcase, CheckSquare, UserPlus, FileText, Edit, Activity } from 'lucide-react'
import type { UserActivity } from '../../store/slices/usersSlice'
import { formatDateTime } from '../../lib/utils'

interface UserActivityFeedProps {
  activity: UserActivity[]
}

function getEventIcon(eventType: string) {
  if (eventType.startsWith('deal')) return Briefcase
  if (eventType.startsWith('task')) return CheckSquare
  if (eventType === 'contact_added') return UserPlus
  if (eventType === 'note_added') return FileText
  if (eventType.includes('update') || eventType.includes('changed')) return Edit
  return Activity
}

export default function UserActivityFeed({ activity }: UserActivityFeedProps) {
  return (
    <div data-testid="user-activity-section">
      <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-3">Recent Activity</h2>
      {activity.length === 0 ? (
        <p data-testid="user-activity-empty" className="text-[13px] text-[var(--color-text-muted)] py-4">
          No recent activity
        </p>
      ) : (
        <div className="space-y-0">
          {activity.map((event) => {
            const Icon = getEventIcon(event.event_type)
            return (
              <div
                key={event.id}
                data-testid={`user-activity-${event.id}`}
                className="flex items-start gap-3 py-2.5 border-b border-[var(--color-bg-border)] last:border-b-0"
              >
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-[var(--color-hover)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0">
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p data-testid="activity-description" className="text-[13px] text-[var(--color-text-primary)]">
                    {event.description}
                  </p>
                  <p data-testid="activity-timestamp" className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                    {formatDateTime(event.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
