import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { createTask, fetchTimeline, type DealItem, type UserItem } from "../clientDetailSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  deals: DealItem[];
  users: UserItem[];
}

export function AddTaskModal({ open, onClose, clientId, deals, users }: AddTaskModalProps) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dealId, setDealId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await dispatch(
        createTask({
          title: title.trim(),
          dueDate: dueDate || undefined,
          priority,
          clientId,
          dealId: dealId || undefined,
          assigneeId: assigneeId || undefined,
        })
      ).unwrap();
      dispatch(fetchTimeline(clientId));
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setAssigneeId("");
    setDealId("");
    setError("");
    onClose();
  };

  const dealOptions = [
    { value: "", label: "None" },
    ...deals.map((d) => ({ value: d.id, label: d.name })),
  ];

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <div className="modal-overlay" data-testid="add-task-modal" onClick={resetAndClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Task</h2>
          <button className="modal-close" onClick={resetAndClose} type="button" data-testid="add-task-close">
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
              options={userOptions}
              value={assigneeId}
              onChange={setAssigneeId}
              placeholder="Select assignee..."
              searchable
              testId="add-task-assignee"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deal (optional)</label>
            <FilterSelect
              options={dealOptions}
              value={dealId}
              onChange={setDealId}
              placeholder="Link to a deal..."
              searchable
              testId="add-task-deal"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="add-task-cancel"
            onClick={resetAndClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn--primary"
            data-testid="add-task-submit"
            onClick={handleSubmit}
            disabled={saving}
            type="button"
          >
            {saving ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
