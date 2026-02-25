import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { updateTaskDetailAssignee, fetchTaskDetail } from "../taskDetailSlice";
import type { Task, TaskUser } from "../tasksSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

function formatDueDate(dateStr: string): string {
  // DB stores DATE type, so value is like "2024-10-25"
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getPriorityClass(priority: string): string {
  switch (priority.toLowerCase()) {
    case "high":
      return "task-detail-priority--high";
    case "medium":
      return "task-detail-priority--medium";
    case "low":
      return "task-detail-priority--low";
    case "normal":
      return "task-detail-priority--normal";
    default:
      return "task-detail-priority--normal";
  }
}

function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "open":
      return "task-detail-status--open";
    case "completed":
      return "task-detail-status--completed";
    case "canceled":
      return "task-detail-status--canceled";
    case "in_progress":
      return "task-detail-status--in-progress";
    default:
      return "";
  }
}

function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "open":
      return "Open";
    case "completed":
      return "Completed";
    case "canceled":
      return "Canceled";
    case "in_progress":
      return "In Progress";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

interface TaskDetailHeaderProps {
  task: Task;
  users: TaskUser[];
}

export function TaskDetailHeader({ task, users }: TaskDetailHeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedAssignee, setSelectedAssignee] = useState(task.assigneeId || "");

  useEffect(() => {
    setSelectedAssignee(task.assigneeId || "");
  }, [task.assigneeId]);

  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const handleAssigneeChange = async (newAssigneeId: string) => {
    setSelectedAssignee(newAssigneeId);
    await dispatch(updateTaskDetailAssignee({ taskId: task.id, assigneeId: newAssigneeId }));
    await dispatch(fetchTaskDetail(task.id));
  };

  const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  return (
    <div className="task-detail-header" data-testid="task-detail-header">
      <div className="task-detail-header-top">
        <h1 className="task-detail-title" data-testid="task-detail-title">{task.title}</h1>
        <div className="task-detail-header-badges">
          <span
            className={`task-detail-priority ${getPriorityClass(task.priority)}`}
            data-testid="task-detail-priority"
          >
            {priorityLabel}
          </span>
          <span
            className={`task-detail-status ${getStatusClass(task.status)}`}
            data-testid="task-detail-status"
          >
            {formatStatus(task.status)}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-detail-description" data-testid="task-detail-description">
          {task.description}
        </p>
      )}

      <div className="task-detail-fields">
        <div className="task-detail-field">
          <span className="task-detail-field-label">Due:</span>
          <span className="task-detail-field-value" data-testid="task-detail-due-date">
            {task.dueDate ? formatDueDate(task.dueDate) : "No due date"}
          </span>
        </div>

        <div className="task-detail-field">
          <span className="task-detail-field-label">Assignee:</span>
          <div className="task-detail-field-select" data-testid="task-detail-assignee">
            <FilterSelect
              options={assigneeOptions}
              value={selectedAssignee}
              onChange={handleAssigneeChange}
              placeholder="Select assignee..."
              searchable
              testId="task-assignee-select"
            />
          </div>
        </div>

        <div className="task-detail-field">
          <span className="task-detail-field-label">Client:</span>
          {task.clientId ? (
            <button
              className="task-detail-link"
              data-testid="task-detail-client-link"
              onClick={() => navigate(`/clients/${task.clientId}`)}
              type="button"
            >
              {task.clientName}
            </button>
          ) : (
            <span className="task-detail-field-value" data-testid="task-detail-client-link">None</span>
          )}
        </div>

        <div className="task-detail-field">
          <span className="task-detail-field-label">Deal:</span>
          {task.dealId ? (
            <button
              className="task-detail-link"
              data-testid="task-detail-deal-link"
              onClick={() => navigate(`/deals/${task.dealId}`)}
              type="button"
            >
              {task.dealName}
            </button>
          ) : (
            <span className="task-detail-field-value" data-testid="task-detail-deal-link">None</span>
          )}
        </div>
      </div>
    </div>
  );
}
