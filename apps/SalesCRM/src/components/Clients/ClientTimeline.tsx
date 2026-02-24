import { useNavigate } from 'react-router-dom'
import type { ClientTimelineEvent } from '../../store/slices/clientsSlice'

interface ClientTimelineProps {
  timeline: ClientTimelineEvent[]
}

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays === 2) return '2 days ago'
  if (diffDays === 3) return '3 days ago'
  if (diffDays <= 7) return 'Last Week'
  if (diffDays <= 14) return '2 weeks ago'
  if (diffDays <= 30) return 'Last Month'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

const eventTypeLabels: Record<string, string> = {
  client_created: 'Client Created',
  client_updated: 'Client Updated',
  task_created: 'Task Created',
  task_status_changed: 'Task Completed',
  task_completed: 'Task Completed',
  deal_created: 'Deal Created',
  deal_stage_changed: 'Deal Stage Changed',
  contact_added: 'Contact Added',
  note_added: 'Note Added',
  email_sent: 'Email Sent',
  status_changed: 'Status Changed',
}

export default function ClientTimeline({ timeline }: ClientTimelineProps) {
  const navigate = useNavigate()

  function renderActorLink(event: ClientTimelineEvent) {
    if (!event.actor_name || event.actor_name === 'System') {
      return <span className="text-[var(--color-text-muted)]">System</span>
    }
    if (event.actor_id) {
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`/users/${event.actor_id}`) }}
          className="text-[var(--color-accent)] hover:underline cursor-pointer"
        >
          {event.actor_name}
        </button>
      )
    }
    return <span>{event.actor_name}</span>
  }

  function renderEntityLinks(event: ClientTimelineEvent) {
    const links: React.ReactNode[] = []

    if (event.task_id) {
      links.push(
        <button
          key="task"
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${event.task_id}`) }}
          className="text-[var(--color-accent)] hover:underline cursor-pointer"
        >
          {extractQuotedName(event.description) || 'View Task'}
        </button>
      )
    }

    if (event.deal_id) {
      links.push(
        <button
          key="deal"
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`/deals/${event.deal_id}`) }}
          className="text-[var(--color-accent)] hover:underline cursor-pointer"
        >
          {extractQuotedName(event.description) || 'View Deal'}
        </button>
      )
    }

    if (event.individual_id) {
      links.push(
        <button
          key="individual"
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`/individuals/${event.individual_id}`) }}
          className="text-[var(--color-accent)] hover:underline cursor-pointer"
        >
          {extractQuotedName(event.description) || 'View Contact'}
        </button>
      )
    }

    return links
  }

  function extractQuotedName(description: string): string | null {
    // Extract text after the colon, e.g. "Task created: Follow up on proposal"
    const colonIdx = description.indexOf(': ')
    if (colonIdx >= 0) {
      return description.slice(colonIdx + 2)
    }
    return null
  }

  // Group events by relative date
  const groups: Array<{ label: string; events: ClientTimelineEvent[] }> = []
  let currentLabel = ''
  for (const event of timeline) {
    const label = getRelativeDate(event.created_at)
    if (label !== currentLabel) {
      currentLabel = label
      groups.push({ label, events: [event] })
    } else {
      groups[groups.length - 1].events.push(event)
    }
  }

  return (
    <div data-testid="client-timeline" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)]">Timeline</h2>
      </div>

      {timeline.length === 0 ? (
        <div data-testid="client-timeline-empty" className="rounded-lg border border-[var(--color-bg-border)] p-6 text-center">
          <p className="text-[13px] text-[var(--color-text-muted)]">No activity yet</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[var(--color-bg-border)]" />

          {groups.map((group, gi) => (
            <div key={gi} className="mb-4 last:mb-0">
              {/* Date label */}
              <div className="relative flex items-center gap-3 mb-2 pl-6">
                <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  {group.label}
                </span>
              </div>

              {group.events.map((event) => (
                <div
                  key={event.id}
                  data-testid={`timeline-event-${event.id}`}
                  className="relative flex gap-3 pb-3 last:pb-0"
                >
                  {/* Dot indicator */}
                  <div className="relative z-10 shrink-0 w-[15px] flex items-start justify-center pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-bg-base)]" />
                  </div>

                  {/* Event content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="text-[12px] text-[var(--color-text-primary)]">
                      <span className="font-medium">
                        {eventTypeLabels[event.event_type] || event.event_type}
                      </span>
                      {': '}
                      {renderEntityLinks(event).length > 0 ? (
                        renderEntityLinks(event)
                      ) : (
                        <span>{extractQuotedName(event.description) || event.description}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      by {renderActorLink(event)}
                      <span className="ml-2">
                        {new Date(event.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
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
