import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { completeTask, fetchTimeline, type TaskItem } from "../clientDetailSlice";

interface TasksSectionProps {
  tasks: TaskItem[];
  clientId: string;
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
  if (date < today) return `Due: ${date.toLocaleDateString()}  (Overdue)`;
  return `Due: ${date.toLocaleDateString()}`;
}

export function TasksSection({ tasks, clientId }: TasksSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const unresolvedTasks = tasks.filter((t) => t.status === "open" || t.status === "in_progress");

  const handleComplete = async (taskId: string) => {
    await dispatch(completeTask(taskId)).unwrap();
    dispatch(fetchTimeline(clientId));
  };

  return (
    <div className="detail-section" data-testid="tasks-section">
      <div className="detail-section-header">
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h3 className="detail-section-title">Tasks</h3>
          <span className="detail-section-subtitle">Unresolved tasks</span>
        </div>
      </div>
      <div className="detail-section-body">
        {unresolvedTasks.length === 0 ? (
          <p className="detail-section-empty" data-testid="tasks-empty">
            No unresolved tasks
          </p>
        ) : (
          unresolvedTasks.map((task) => (
            <div key={task.id} className="task-item" data-testid="task-item">
              <button
                className="task-checkbox"
                data-testid="task-checkbox"
                onClick={() => handleComplete(task.id)}
                type="button"
                title="Mark complete"
              />
              <div className="task-content" onClick={() => navigate(`/tasks/${task.id}`)}>
                <div className="task-title" data-testid="task-title">
                  {task.title}
                </div>
                <div className="task-meta">
                  {task.dueDate && (
                    <span data-testid="task-due-date">{formatDueDate(task.dueDate)}</span>
                  )}
                  {task.dealName && (
                    <span data-testid="task-deal">Deal: &apos;{task.dealName}&apos;</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
