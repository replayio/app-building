import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { createDealTask, completeDealTask } from "../dealDetailSlice";
import type { DealTask, DealUser } from "../dealDetailSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface LinkedTasksSectionProps {
  tasks: DealTask[];
  dealId: string;
  clientId: string;
  users: DealUser[];
}

export function LinkedTasksSection({ tasks, dealId, clientId, users }: LinkedTasksSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showAddTask, setShowAddTask] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await dispatch(createDealTask({
        title: title.trim(),
        dueDate: dueDate || undefined,
        priority,
        clientId,
        dealId,
        assigneeId: assigneeId || undefined,
      })).unwrap();
      setShowAddTask(false);
      setTitle("");
      setDueDate("");
      setPriority("medium");
      setAssigneeId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    await dispatch(completeDealTask(taskId));
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  return (
    <div className="detail-section" data-testid="linked-tasks-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">Linked Tasks</h3>
        <button
          className="btn btn--secondary btn--sm"
          data-testid="linked-tasks-add-btn"
          onClick={() => setShowAddTask(true)}
          type="button"
        >
          Add Task
        </button>
      </div>
      <div className="detail-section-body">
        {tasks.length === 0 ? (
          <div className="detail-section-empty" data-testid="linked-tasks-empty">No linked tasks</div>
        ) : (
          <div className="linked-tasks-list" data-testid="linked-tasks-list">
            {tasks.map((task) => {
              const isCompleted = task.status === "completed";
              return (
                <div key={task.id} className="task-item" data-testid={`linked-task-${task.id}`}>
                  <button
                    className={`task-checkbox ${isCompleted ? "task-checkbox--checked" : ""}`}
                    data-testid={`linked-task-checkbox-${task.id}`}
                    onClick={() => !isCompleted && handleComplete(task.id)}
                    type="button"
                    disabled={isCompleted}
                  >
                    {isCompleted && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <div className="task-content" onClick={() => handleTaskClick(task.id)}>
                    <span className={`task-title ${isCompleted ? "task-title--completed" : ""}`} data-testid={`linked-task-title-${task.id}`}>
                      {task.title}
                    </span>
                    <span className="task-meta" data-testid={`linked-task-meta-${task.id}`}>
                      {isCompleted
                        ? `(Completed: ${formatShortDate(task.updatedAt)})`
                        : task.dueDate
                          ? `(Due: ${formatShortDate(task.dueDate)})`
                          : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddTask && (
        <div className="modal-overlay" data-testid="add-task-modal" onClick={() => setShowAddTask(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Task</h2>
              <button className="modal-close" onClick={() => setShowAddTask(false)} type="button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {error && <div className="modal-error" data-testid="add-task-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  data-testid="add-task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>
              <div className="form-row">
                <div className="form-group form-group--half">
                  <label className="form-label">Due Date</label>
                  <input
                    className="form-input"
                    data-testid="add-task-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group form-group--half">
                  <label className="form-label">Priority</label>
                  <FilterSelect
                    options={priorityOptions}
                    value={priority}
                    onChange={setPriority}
                    testId="add-task-priority"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <FilterSelect
                  options={assigneeOptions}
                  value={assigneeId}
                  onChange={setAssigneeId}
                  placeholder="Select assignee..."
                  searchable
                  testId="add-task-assignee"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn--secondary" onClick={() => setShowAddTask(false)} type="button">
                Cancel
              </button>
              <button className="btn btn--primary" onClick={handleCreate} disabled={creating} type="button" data-testid="add-task-submit">
                {creating ? "Creating..." : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
