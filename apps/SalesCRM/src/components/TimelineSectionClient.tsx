import { Link } from "react-router-dom";
import { type TimelineEvent } from "../clientDetailSlice";

interface TimelineSectionClientProps {
  events: TimelineEvent[];
}

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last Week";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "Last Month";
  return `${Math.floor(diffDays / 30)} months ago`;
}

function getEventTypeClass(eventType: string): string {
  const lower = eventType.toLowerCase();
  if (lower.includes("task")) return "timeline-event-icon--task";
  if (lower.includes("deal")) return "timeline-event-icon--deal";
  if (lower.includes("contact") || lower.includes("person")) return "timeline-event-icon--contact";
  if (lower.includes("note")) return "timeline-event-icon--note";
  if (lower.includes("email")) return "timeline-event-icon--default";
  if (lower.includes("update")) return "timeline-event-icon--updated";
  return "timeline-event-icon--default";
}

function getEventIcon(eventType: string): React.ReactElement {
  const lower = eventType.toLowerCase();
  if (lower.includes("task")) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4.5 7L6 8.5L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (lower.includes("deal")) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1V13M4 3H9.5C10.33 3 11 3.67 11 4.5C11 5.33 10.33 6 9.5 6H4M4 6H10C10.83 6 11.5 6.67 11.5 7.5C11.5 8.33 10.83 9 10 9H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (lower.includes("contact") || lower.includes("person")) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.5 12C2.5 9.5 4.5 8 7 8C9.5 8 11.5 9.5 11.5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (lower.includes("note")) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M4 5H10M4 7.5H8M3 1.5H11C11.83 1.5 12.5 2.17 12.5 3V11C12.5 11.83 11.83 12.5 11 12.5H3C2.17 12.5 1.5 11.83 1.5 11V3C1.5 2.17 2.17 1.5 3 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (lower.includes("email")) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1.5 4.5L7 8L12.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  // Default: updated/created
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4V7H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Group events by relative date
function groupByDate(events: TimelineEvent[]): { label: string; events: TimelineEvent[] }[] {
  const groups: Map<string, TimelineEvent[]> = new Map();
  for (const event of events) {
    const label = getRelativeDate(event.createdAt);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(event);
  }
  return Array.from(groups.entries()).map(([label, events]) => ({ label, events }));
}

export function TimelineSectionClient({ events }: TimelineSectionClientProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const groups = groupByDate(sorted);

  return (
    <div className="detail-section" data-testid="timeline-section" style={{ gridColumn: "1 / -1" }}>
      <div className="detail-section-header">
        <h3 className="detail-section-title">Timeline</h3>
      </div>
      <div className="detail-section-body">
        {sorted.length === 0 ? (
          <p className="detail-section-empty" data-testid="timeline-empty">
            No activity yet
          </p>
        ) : (
          <div data-testid="timeline-list">
            {groups.map((group) => (
              <div key={group.label} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                  data-testid="timeline-date-label"
                >
                  {group.label}
                </div>
                {group.events.map((event, index) => (
                  <div
                    key={event.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      paddingBottom: index < group.events.length - 1 ? 12 : 0,
                      marginBottom: index < group.events.length - 1 ? 12 : 0,
                      borderBottom:
                        index < group.events.length - 1
                          ? "1px solid var(--bg-border-color-light)"
                          : "none",
                    }}
                    data-testid="timeline-event"
                  >
                    <div
                      className={getEventTypeClass(event.eventType)}
                      style={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background: "var(--bg-base-color)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {getEventIcon(event.eventType)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="client-timeline-event-links"
                        style={{ fontSize: 13, color: "var(--text-primary)" }}
                        data-testid="timeline-event-description"
                      >
                        {renderDescription(event)}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 2,
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <span data-testid="timeline-event-time">
                          {new Date(event.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span data-testid="timeline-event-actor">
                          by{" "}
                          {event.createdBy === "System" ? (
                            "System"
                          ) : (
                            <Link
                              to="#"
                              style={{ color: "var(--accent-primary)", textDecoration: "none" }}
                            >
                              {event.createdBy}
                            </Link>
                          )}
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
    </div>
  );
}

function renderDescription(event: TimelineEvent): React.ReactNode {
  const { description, relatedEntityType, relatedEntityId } = event;

  // If there's a related entity, make the description include a link
  if (relatedEntityType && relatedEntityId) {
    let linkPath = "#";
    if (relatedEntityType === "task") linkPath = `/tasks/${relatedEntityId}`;
    else if (relatedEntityType === "deal") linkPath = `/deals/${relatedEntityId}`;
    else if (relatedEntityType === "individual") linkPath = `/individuals/${relatedEntityId}`;

    // Try to extract the quoted entity name from description
    const quoteMatch = description.match(/'([^']+)'/);
    if (quoteMatch) {
      const entityName = quoteMatch[1];
      const prefix = description.slice(0, description.indexOf(`'${entityName}'`));
      const suffix = description.slice(description.indexOf(`'${entityName}'`) + entityName.length + 2);
      return (
        <span>
          {prefix}
          <Link to={linkPath} style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 500 }}>
            {entityName}
          </Link>
          {suffix}
        </span>
      );
    }
  }

  return <span>{description}</span>;
}
