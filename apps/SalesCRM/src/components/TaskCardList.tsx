import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { updateTaskStatus, deleteTask } from "../tasksSlice";
import type { Task } from "../tasksSlice";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";

interface TaskCardListProps {
  tasks: Task[];
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Due: Today";
  if (date.getTime() === tomorrow.getTime()) return "Due: Tomorrow";
  return `Due: ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function getPriorityClass(priority: string): string {
  switch (priority.toLowerCase()) {
    case "high": return "task-card-priority--high";
    case "medium": return "task-card-priority--medium";
    case "low": return "task-card-priority--low";
    case "normal": return "task-card-priority--normal";
    default: return "task-card-priority--normal";
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TaskCardList({ tasks }: TaskCardListProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpenMenuId(null);
    }
  }, []);

  useEffect(() => {
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, handleClickOutside]);

  const handleMarkComplete = async (taskId: string) => {
    setOpenMenuId(null);
    await dispatch(updateTaskStatus({ taskId, status: "completed" }));
  };

  const handleCancel = async (taskId: string) => {
    setOpenMenuId(null);
    await dispatch(updateTaskStatus({ taskId, status: "canceled" }));
  };

  const handleDelete = async (taskId: string) => {
    setDeleteConfirmId(null);
    await dispatch(deleteTask(taskId));
  };

  if (tasks.length === 0) {
    return (
      <div className="tasks-empty" data-testid="tasks-empty">
        No tasks found
      </div>
    );
  }

  return (
    <div className="task-card-list" data-testid="task-card-list">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="task-card"
          data-testid="task-card"
          onClick={() => navigate(`/tasks/${task.id}`)}
        >
          <div className="task-card-left">
            <span
              className={`task-card-priority ${getPriorityClass(task.priority)}`}
              data-testid="task-card-priority"
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <div className="task-card-info">
              <span className="task-card-title" data-testid="task-card-title">{task.title}</span>
              {task.dueDate && (
                <span className="task-card-due" data-testid="task-card-due">{formatDueDate(task.dueDate)}</span>
              )}
            </div>
          </div>
          <div className="task-card-right">
            {task.assigneeName && (
              <div className="task-card-assignee" data-testid="task-card-assignee">
                {task.assigneeAvatar ? (
                  <img className="task-card-assignee-avatar" src={task.assigneeAvatar} alt={task.assigneeName} />
                ) : (
                  <span className="task-card-assignee-initials">{getInitials(task.assigneeName)}</span>
                )}
                <span className="task-card-assignee-name">{task.assigneeName}</span>
              </div>
            )}
            <div
              className="task-card-actions-wrapper"
              ref={openMenuId === task.id ? menuRef : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="task-card-actions-btn"
                data-testid="task-card-actions-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === task.id ? null : task.id);
                }}
                type="button"
              >
                ···
              </button>
              {openMenuId === task.id && (
                <div className="task-card-actions-menu" data-testid="task-card-actions-menu">
                  <button
                    className="task-card-action"
                    data-testid="task-action-edit"
                    onClick={() => {
                      setOpenMenuId(null);
                      navigate(`/tasks/${task.id}`);
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="task-card-action"
                    data-testid="task-action-complete"
                    onClick={() => handleMarkComplete(task.id)}
                    type="button"
                  >
                    Mark Complete
                  </button>
                  <button
                    className="task-card-action"
                    data-testid="task-action-cancel"
                    onClick={() => handleCancel(task.id)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="task-card-action task-card-action--danger"
                    data-testid="task-action-delete"
                    onClick={() => {
                      setOpenMenuId(null);
                      setDeleteConfirmId(task.id);
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={deleteConfirmId !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
