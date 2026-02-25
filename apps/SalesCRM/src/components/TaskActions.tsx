import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { updateTaskDetailStatus, fetchTaskDetail } from "../taskDetailSlice";

interface TaskActionsProps {
  taskId: string;
  status: string;
}

export function TaskActions({ taskId, status }: TaskActionsProps) {
  const dispatch = useAppDispatch();
  const [updating, setUpdating] = useState(false);

  const isOpen = status.toLowerCase() === "open" || status.toLowerCase() === "in_progress";

  const handleMarkComplete = async () => {
    setUpdating(true);
    await dispatch(updateTaskDetailStatus({ taskId, status: "completed" }));
    await dispatch(fetchTaskDetail(taskId));
    setUpdating(false);
  };

  const handleCancel = async () => {
    setUpdating(true);
    await dispatch(updateTaskDetailStatus({ taskId, status: "canceled" }));
    await dispatch(fetchTaskDetail(taskId));
    setUpdating(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="task-actions" data-testid="task-actions">
      <button
        className="btn btn--primary task-action-complete-btn"
        data-testid="mark-complete-btn"
        onClick={handleMarkComplete}
        disabled={updating}
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Mark Complete
      </button>
      <button
        className="btn btn--danger-outline task-action-cancel-btn"
        data-testid="cancel-task-btn"
        onClick={handleCancel}
        disabled={updating}
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Cancel
      </button>
    </div>
  );
}
