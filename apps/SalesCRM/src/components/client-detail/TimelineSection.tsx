import type { TimelineEvent } from '../../types'

interface TimelineSectionProps {
  events: TimelineEvent[]
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays} days ago`
  if (diffDays <= 14) return 'Last Week'
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays <= 60) return 'Last Month'
  return date.toLocaleDateString()
}

function getEventIcon(eventType: string): string {
  switch (eventType) {
    case 'task_created': return '●'
    case 'task_completed': return '●'
    case 'deal_created': return '●'
    case 'deal_stage_changed': return '●'
    case 'note_added': return '●'
    case 'email_sent': return '●'
    case 'contact_added': return '●'
    case 'attachment_added': return '●'
    case 'status_changed': return '●'
    case 'name_changed': return '●'
    case 'tags_changed': return '●'
    case 'type_changed': return '●'
    default: return '●'
  }
}

function getEventColor(eventType: string): string {
  switch (eventType) {
    case 'task_created': return 'text-accent'
    case 'task_completed': return 'text-status-active'
    case 'deal_created': return 'text-accent-purple'
    case 'deal_stage_changed': return 'text-accent-blue'
    case 'note_added': return 'text-text-muted'
    case 'email_sent': return 'text-accent-blue'
    case 'contact_added': return 'text-status-prospect'
    case 'attachment_added': return 'text-text-muted'
    case 'status_changed': return 'text-accent'
    case 'name_changed': return 'text-accent'
    case 'tags_changed': return 'text-accent-blue'
    case 'type_changed': return 'text-accent-purple'
    default: return 'text-text-muted'
  }
}

export function TimelineSection({ events }: TimelineSectionProps) {
  // Group events by relative date
  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const label = formatRelativeDate(event.created_at)
    if (!acc[label]) acc[label] = []
    acc[label].push(event)
    return acc
  }, {})

  return (
    <div className="border border-border rounded-[6px] p-4 mb-4" data-testid="timeline-section">
      <h2 className="text-[14px] font-semibold text-text-primary mb-3">Timeline</h2>

      {events.length === 0 ? (
        <div className="text-[13px] text-text-muted py-2" data-testid="timeline-empty-state">No timeline events</div>
      ) : (
        <div className="relative">
          {Object.entries(grouped).map(([dateLabel, groupEvents]) => (
            <div key={dateLabel} className="mb-4 last:mb-0" data-testid="timeline-date-group">
              <div className="text-[12px] font-medium text-text-muted mb-2" data-testid="timeline-date-label">{dateLabel}</div>
              {groupEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 mb-2 last:mb-0 pl-2" data-testid={`timeline-entry-${event.id}`}>
                  <span className={`flex-shrink-0 text-[8px] mt-1.5 ${getEventColor(event.event_type)}`}>
                    {getEventIcon(event.event_type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-text-primary" data-testid={`timeline-event-description-${event.id}`}>
                      {event.description}
                      {event.user_name && (
                        <span className="text-accent-blue ml-1" data-testid={`timeline-event-user-${event.id}`}>
                          by {event.user_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
