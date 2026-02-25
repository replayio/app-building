import "./TimelineSection.css";

export type TimelineEventType =
  | "created"
  | "updated"
  | "status_change"
  | "approval"
  | "delivery"
  | "note"
  | "task"
  | "contact"
  | "deal"
  | "default";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  description: string;
  timestamp: string;
  actor?: string;
  detail?: string;
}

interface TimelineSectionProps {
  title: string;
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  emptyMessage?: string;
  maxVisible?: number;
}

const EVENT_ICONS: Record<TimelineEventType, React.ReactElement> = {
  created: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4V10M4 7H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  updated: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M10.5 2L12 3.5L5.5 10H4V8.5L10.5 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  status_change: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  approval: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 7L6 9.5L10.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  delivery: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 4L7 1L13 4V10L7 13L1 10V4Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  note: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4 5H10M4 7.5H8M3 1.5H11C11.83 1.5 12.5 2.17 12.5 3V11C12.5 11.83 11.83 12.5 11 12.5H3C2.17 12.5 1.5 11.83 1.5 11V3C1.5 2.17 2.17 1.5 3 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  task: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 7L6 8.5L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  contact: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 12C2.5 9.5 4.5 8 7 8C9.5 8 11.5 9.5 11.5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  deal: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1V13M4 3H9.5C10.33 3 11 3.67 11 4.5C11 5.33 10.33 6 9.5 6H4M4 6H10C10.83 6 11.5 6.67 11.5 7.5C11.5 8.33 10.83 9 10 9H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  default: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" fill="currentColor" />
    </svg>
  ),
};

export function TimelineSection({
  title,
  events,
  onEventClick,
  emptyMessage = "No activity yet.",
  maxVisible,
}: TimelineSectionProps): React.ReactElement {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const visible = maxVisible ? sorted.slice(0, maxVisible) : sorted;

  return (
    <div className="timeline-section" data-testid="timeline-section">
      <h3 className="timeline-section-title" data-testid="timeline-section-title">
        {title}
      </h3>

      {visible.length === 0 ? (
        <p className="timeline-empty" data-testid="timeline-empty">
          {emptyMessage}
        </p>
      ) : (
        <div className="timeline-list" data-testid="timeline-list">
          {visible.map((event, index) => {
            const isLast = index === visible.length - 1;
            const Tag = onEventClick ? "button" : "div";
            return (
              <Tag
                key={event.id}
                className={`timeline-event${onEventClick ? " timeline-event--clickable" : ""}`}
                data-testid="timeline-event"
                {...(onEventClick
                  ? { onClick: () => onEventClick(event), type: "button" as const }
                  : {})}
              >
                <div className="timeline-event-indicator">
                  <span className={`timeline-event-icon timeline-event-icon--${event.type}`}>
                    {EVENT_ICONS[event.type] || EVENT_ICONS.default}
                  </span>
                  {!isLast && <span className="timeline-event-line" />}
                </div>
                <div className="timeline-event-content">
                  <p className="timeline-event-description" data-testid="timeline-event-description">
                    {event.description}
                  </p>
                  {event.detail && (
                    <p className="timeline-event-detail" data-testid="timeline-event-detail">
                      {event.detail}
                    </p>
                  )}
                  <span className="timeline-event-meta">
                    <span className="timeline-event-timestamp" data-testid="timeline-event-timestamp">
                      {event.timestamp}
                    </span>
                    {event.actor && (
                      <span className="timeline-event-actor" data-testid="timeline-event-actor">
                        by {event.actor}
                      </span>
                    )}
                  </span>
                </div>
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
}
