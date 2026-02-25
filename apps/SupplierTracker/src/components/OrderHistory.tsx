import type { OrderHistoryEntry } from "../slices/ordersSlice";
import { TimelineSection, type TimelineEvent, type TimelineEventType } from "@shared/components/TimelineSection";
import { formatDateTime } from "@shared/utils/date";

interface OrderHistoryProps {
  history: OrderHistoryEntry[];
}

function mapEventType(eventType: string): TimelineEventType {
  switch (eventType) {
    case "created":
      return "created";
    case "status_change":
      return "status_change";
    case "approval":
      return "approval";
    case "document":
      return "note";
    case "line_item_added":
    case "line_item_updated":
    case "line_item_deleted":
      return "updated";
    default:
      return "default";
  }
}

export function OrderHistory({ history }: OrderHistoryProps) {
  const events: TimelineEvent[] = history.map((entry) => ({
    id: entry.id,
    type: mapEventType(entry.event_type),
    description: entry.description,
    timestamp: formatDateTime(entry.created_at),
    actor: entry.actor,
  }));

  return (
    <div className="section-card" data-testid="order-history">
      <div className="section-card-body">
        <TimelineSection
          title="Order History"
          events={events}
          emptyMessage="No history entries yet."
        />
      </div>
    </div>
  );
}
