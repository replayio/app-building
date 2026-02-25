import type { UserActivity } from "../userDetailSlice";

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getEventIcon(eventType: string): string {
  const type = eventType.toLowerCase();
  if (type.includes("deal")) return "deal";
  if (type.includes("task")) return "task";
  if (type.includes("client")) return "client";
  if (type.includes("note")) return "note";
  return "default";
}

interface RecentActivityFeedProps {
  activity: UserActivity[];
}

export function RecentActivityFeed({ activity }: RecentActivityFeedProps) {
  return (
    <div className="user-detail-section" data-testid="recent-activity-feed">
      <h2 className="user-detail-section-title">Recent Activity</h2>
      {activity.length === 0 ? (
        <div className="user-detail-section-empty" data-testid="activity-empty">
          No recent activity
        </div>
      ) : (
        <div className="user-activity-feed">
          {activity.map((item) => (
            <div
              key={item.id}
              className="user-activity-item"
              data-testid="activity-item"
            >
              <div className={`user-activity-icon user-activity-icon--${getEventIcon(item.eventType)}`}>
                <ActivityIcon eventType={item.eventType} />
              </div>
              <div className="user-activity-content">
                <span className="user-activity-description" data-testid="activity-description">
                  {item.description}
                </span>
                <span className="user-activity-time" data-testid="activity-timestamp">
                  {formatTimestamp(item.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityIcon({ eventType }: { eventType: string }) {
  const type = eventType.toLowerCase();

  if (type.includes("deal") || type.includes("stage")) {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L10 5.5L15 6.2L11.5 9.5L12.4 14.5L8 12.2L3.6 14.5L4.5 9.5L1 6.2L6 5.5L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type.includes("task")) {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type.includes("client")) {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 13V12C2 10.3 3.3 9 5 9H11C12.7 9 14 10.3 14 12V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
