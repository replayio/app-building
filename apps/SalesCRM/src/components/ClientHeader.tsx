import { useState, useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { updateClient, fetchTimeline, type ClientDetail } from "../clientDetailSlice";
import { useAuth } from "@shared/auth/useAuth";

interface ClientHeaderProps {
  client: ClientDetail;
}

const STATUS_CLASSES: Record<string, string> = {
  active: "badge--active",
  inactive: "badge--inactive",
  prospect: "badge--prospect",
  churned: "badge--churned",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editType, setEditType] = useState(client.type);
  const [editStatus, setEditStatus] = useState(client.status);
  const [editTags, setEditTags] = useState<string[]>(client.tags);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditName(client.name);
    setEditType(client.type);
    setEditStatus(client.status);
    setEditTags([...client.tags]);
  }, [client]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateClient({
          clientId: client.id,
          data: {
            name: editName,
            type: editType,
            status: editStatus,
            tags: editTags,
          },
        })
      ).unwrap();

      // Create timeline event for update
      const actor = user ? user.name : "System";
      await fetch("/.netlify/functions/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          eventType: "Client Updated",
          description: `Client Updated: details changed`,
          createdBy: actor,
        }),
      });
      dispatch(fetchTimeline(client.id));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(client.name);
    setEditType(client.type);
    setEditStatus(client.status);
    setEditTags([...client.tags]);
    setNewTag("");
    setEditing(false);
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag));
  };

  return (
    <div className="client-header" data-testid="client-header">
      <div className="client-header-top">
        <div className="client-header-info">
          <div className="client-header-name-row">
            <h1 className="client-header-name" data-testid="client-name">
              {client.name}
            </h1>
            <div className="client-header-badges">
              <span className="badge badge--type" data-testid="client-type-badge">
                {capitalize(client.type)}
              </span>
              <span
                className={`badge ${STATUS_CLASSES[client.status] || "badge--neutral"}`}
                data-testid="client-status-badge"
              >
                {capitalize(client.status)}
              </span>
            </div>
          </div>
          {client.tags.length > 0 && (
            <div className="client-header-tags" data-testid="client-tags">
              {client.tags.map((tag) => (
                <span key={tag} className="client-header-tag" data-testid="client-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="client-header-actions">
          <button
            className="client-header-edit-btn"
            data-testid="client-edit-btn"
            onClick={() => setEditing(true)}
            type="button"
            title="Edit client details"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M11.5 2.5L13.5 4.5L5.5 12.5H3.5V10.5L11.5 2.5Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" data-testid="client-edit-modal" onClick={handleCancel}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Client</h2>
              <button className="modal-close" onClick={handleCancel} type="button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  data-testid="edit-client-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group form-group--half">
                  <label className="form-label">Type</label>
                  <div className="filter-select" style={{ position: "relative" }}>
                    <button
                      className="filter-select-trigger"
                      data-testid="edit-client-type"
                      type="button"
                      onClick={(e) => {
                        const dropdown = e.currentTarget.nextElementSibling;
                        if (dropdown) {
                          dropdown.classList.toggle("filter-select-dropdown--visible");
                        }
                      }}
                    >
                      <span className="filter-select-value">{capitalize(editType)}</span>
                    </button>
                  </div>
                  <select
                    className="form-input"
                    style={{ marginTop: 4, height: 36 }}
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    data-testid="edit-client-type-select"
                  >
                    <option value="organization">Organization</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div className="form-group form-group--half">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    style={{ height: 36 }}
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    data-testid="edit-client-status-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="edit-form-tags">
                  {editTags.map((tag) => (
                    <span key={tag} className="edit-form-tag">
                      {tag}
                      <button
                        className="edit-form-tag-remove"
                        onClick={() => removeTag(tag)}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    className="edit-form-tag-input"
                    data-testid="edit-client-tag-input"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn--secondary"
                data-testid="edit-client-cancel"
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                data-testid="edit-client-save"
                onClick={handleSave}
                disabled={saving || !editName.trim()}
                type="button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
