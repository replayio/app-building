import { useNavigate } from "react-router-dom";
import type { UserTask } from "../userDetailSlice";

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatStatus(status: string): string {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "canceled":
      return "Canceled";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function getPriorityClass(priority: string): string {
  switch (priority) {
    case "high":
    case "urgent":
      return "user-task-priority--high";
    case "medium":
      return "user-task-priority--medium";
    case "low":
      return "user-task-priority--low";
    default:
      return "user-task-priority--normal";
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case "open":
      return "user-task-status--open";
    case "in_progress":
      return "user-task-status--in-progress";
    case "completed":
      return "user-task-status--completed";
    case "canceled":
      return "user-task-status--canceled";
    default:
      return "";
  }
}

interface AssignedTasksListProps {
  tasks: UserTask[];
}

export function AssignedTasksList({ tasks }: AssignedTasksListProps) {
  const navigate = useNavigate();

  return (
    <div className="user-detail-section" data-testid="assigned-tasks-list">
      <h2 className="user-detail-section-title">Assigned Tasks</h2>
      {tasks.length === 0 ? (
        <div className="user-detail-section-empty" data-testid="assigned-tasks-empty">
          No assigned tasks
        </div>
      ) : (
        <div className="user-detail-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="user-detail-list-item user-detail-list-item--clickable"
              data-testid="assigned-task-item"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <div className="user-detail-list-item-main">
                <span className="user-detail-list-item-name" data-testid="task-title">
                  {task.title}
                </span>
                <div className="user-detail-list-item-meta-row">
                  {task.clientName && (
                    <span className="user-detail-list-item-meta" data-testid="task-client">
                      {task.clientName}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="user-detail-list-item-meta" data-testid="task-due-date">
                      Due {formatDueDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="user-detail-list-item-right">
                <span
                  className={`user-task-priority ${getPriorityClass(task.priority)}`}
                  data-testid="task-priority"
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <span
                  className={`user-task-status ${getStatusClass(task.status)}`}
                  data-testid="task-status"
                >
                  {formatStatus(task.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
