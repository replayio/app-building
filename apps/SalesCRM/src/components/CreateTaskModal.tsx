import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { createTask, fetchClientDeals, clearClientDeals } from "../tasksSlice";
import type { TaskClient, TaskUser, TaskDeal } from "../tasksSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  clients: TaskClient[];
  users: TaskUser[];
  clientDeals: TaskDeal[];
}

const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
];

export function CreateTaskModal({ open, onClose, clients, users, clientDeals }: CreateTaskModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [clientId, setClientId] = useState("");
  const [dealId, setDealId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientDeals(clientId));
    } else {
      dispatch(clearClientDeals());
    }
    setDealId("");
  }, [clientId, dispatch]);

  if (!open) return null;

  const clientOptions = [
    { value: "", label: "Select client..." },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const dealOptions = [
    { value: "", label: "No deal" },
    ...clientDeals.map((d) => ({ value: d.id, label: d.name })),
  ];

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
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          priority,
          clientId: clientId || undefined,
          dealId: dealId || undefined,
          assigneeId: assigneeId || undefined,
        })
      ).unwrap();
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setClientId("");
    setDealId("");
    setAssigneeId("");
    setError("");
    dispatch(clearClientDeals());
    onClose();
  };

  return (
    <div className="modal-overlay" data-testid="create-task-modal" onClick={resetAndClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Task</h2>
          <button className="modal-close" onClick={resetAndClose} type="button" data-testid="create-task-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-error" data-testid="create-task-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              data-testid="create-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              data-testid="create-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label">Due Date</label>
              <input
                className="form-input"
                data-testid="create-task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label">Priority</label>
              <FilterSelect
                options={PRIORITY_OPTIONS}
                value={priority}
                onChange={setPriority}
                testId="create-task-priority"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Client</label>
            <FilterSelect
              options={clientOptions}
              value={clientId}
              onChange={setClientId}
              placeholder="Select client..."
              searchable
              testId="create-task-client"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deal</label>
            <FilterSelect
              options={dealOptions}
              value={dealId}
              onChange={setDealId}
              placeholder={clientId ? "Select deal..." : "Select a client first"}
              searchable
              testId="create-task-deal"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <FilterSelect
              options={userOptions}
              value={assigneeId}
              onChange={setAssigneeId}
              placeholder="Select assignee..."
              searchable
              testId="create-task-assignee"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="create-task-cancel"
            onClick={resetAndClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn--primary"
            data-testid="create-task-submit"
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
