import type { WebhookEvent } from '../store/statusSlice'
import './WebhookEventFeed.css'

interface WebhookEventFeedProps {
  events: WebhookEvent[]
}

function getPayloadSummary(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload)
  if (keys.length === 0) return '—'
  const parts: string[] = []
  for (const key of keys.slice(0, 3)) {
    const val = payload[key]
    const str = typeof val === 'string' ? val : JSON.stringify(val)
    const truncated = str && str.length > 40 ? str.slice(0, 40) + '...' : str
    parts.push(`${key}: ${truncated}`)
  }
  if (keys.length > 3) parts.push(`+${keys.length - 3} more`)
  return parts.join(', ')
}

function WebhookEventFeed({ events }: WebhookEventFeedProps) {
  return (
    <div className="webhook-feed" data-testid="webhook-event-feed">
      <h2 className="webhook-feed__title">Recent Webhook Events</h2>
      {events.length === 0 ? (
        <p className="webhook-feed__empty" data-testid="webhook-feed-empty">
          No webhook events received
        </p>
      ) : (
        <div className="webhook-feed__list">
          {events.map((event) => (
            <div key={event.id} className="webhook-feed__item" data-testid="webhook-event-item">
              <div className="webhook-feed__item-header">
                <span className="webhook-feed__timestamp" data-testid="webhook-event-timestamp">
                  {new Date(event.received_at).toLocaleString()}
                </span>
                <span className="webhook-feed__container-id" data-testid="webhook-event-container-id">
                  {event.container_id}
                </span>
                <span className="webhook-feed__event-type" data-testid="webhook-event-type">
                  {event.event_type}
                </span>
              </div>
              <div className="webhook-feed__payload" data-testid="webhook-event-payload">
                {getPayloadSummary(event.payload)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WebhookEventFeed
