import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface TimelineEvent {
  id: string
  event_type: string
  title: string
  description: string | null
  actor: string | null
  reference_id: string | null
  reference_type: string | null
  event_date: string
}

interface ClientTimelineSectionProps {
  clientId: string
  refreshKey?: number
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays} days ago`
  if (diffDays <= 14) return 'Last Week'
  if (diffDays <= 30) return 'Last Month'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'task_created':
    case 'task_completed':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="m16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.854z"/>
        </svg>
      )
    case 'deal_created':
    case 'deal_stage_change':
    case 'deal_deleted':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      )
    case 'contact_added':
    case 'contact_removed':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
      )
    case 'attachment_uploaded':
    case 'attachment_deleted':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      )
    case 'status_changed':
    case 'name_changed':
    case 'source_info_updated':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )
    case 'note_added':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      )
    case 'email_sent':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      )
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )
  }
}

function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    task_created: 'Task Created',
    task_completed: 'Task Completed',
    deal_created: 'Deal Created',
    deal_stage_change: 'Deal Stage Changed',
    deal_deleted: 'Deal Deleted',
    contact_added: 'Contact Added',
    contact_removed: 'Contact Removed',
    attachment_uploaded: 'Attachment Uploaded',
    attachment_deleted: 'Attachment Deleted',
    status_changed: 'Status Changed',
    name_changed: 'Name Changed',
    source_info_updated: 'Source Info Updated',
    note_added: 'Note Added',
    email_sent: 'Email Sent',
  }
  return labels[eventType] || eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function ClientTimelineSection({ clientId, refreshKey }: ClientTimelineSectionProps) {
  const navigate = useNavigate()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTimeline = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}/timeline`)
      const data = await res.json()
      setEvents(data.events || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline, refreshKey])

  const handleSubjectClick = (event: TimelineEvent) => {
    if (!event.reference_id || !event.reference_type) return
    switch (event.reference_type) {
      case 'deal':
        navigate(`/deals/${event.reference_id}`)
        break
      case 'individual':
        navigate(`/individuals/${event.reference_id}`)
        break
      case 'task':
        navigate('/tasks')
        break
    }
  }

  return (
    <div className="person-section" data-testid="timeline-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <h2 data-testid="timeline-heading">Timeline</h2>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : events.length > 0 ? (
        <div className="timeline-list" data-testid="timeline-list">
          {events.map(event => (
            <div key={event.id} className="timeline-entry" data-testid="timeline-entry">
              <div className="timeline-entry-icon" data-testid="timeline-icon">
                {getEventIcon(event.event_type)}
              </div>
              <div className="timeline-entry-content">
                <div className="timeline-entry-header">
                  <span className="timeline-entry-date" data-testid="timeline-date">
                    {formatRelativeTime(event.event_date)}
                  </span>
                  <span className="timeline-entry-type" data-testid="timeline-event-type">
                    {getEventTypeLabel(event.event_type)}
                  </span>
                </div>
                <div className="timeline-entry-body">
                  {event.reference_id && event.reference_type && ['deal', 'individual', 'task'].includes(event.reference_type) ? (
                    <button
                      className="timeline-subject-link"
                      onClick={() => handleSubjectClick(event)}
                      data-testid="timeline-subject-link"
                    >
                      {event.title}
                    </button>
                  ) : (
                    <span data-testid="timeline-title">{event.title}</span>
                  )}
                  {event.description && (
                    <span className="timeline-entry-description" data-testid="timeline-description">{event.description}</span>
                  )}
                </div>
                {event.actor && (
                  <span className="timeline-entry-actor">
                    by{' '}
                    <button
                      className="timeline-actor-link"
                      onClick={() => {
                        if (event.reference_type === 'individual' && event.reference_id) {
                          navigate(`/individuals/${event.reference_id}`)
                        }
                      }}
                      data-testid="timeline-actor-link"
                    >
                      {event.actor}
                    </button>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="person-section-empty" data-testid="timeline-empty">
          No activity yet
        </div>
      )}
    </div>
  )
}
