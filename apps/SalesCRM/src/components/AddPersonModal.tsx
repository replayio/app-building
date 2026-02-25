import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { createPerson, fetchTimeline } from "../clientDetailSlice";

interface AddPersonModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
}

export function AddPersonModal({ open, onClose, clientId }: AddPersonModalProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await dispatch(
        createPerson({
          name: name.trim(),
          title: role.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          location: location.trim() || undefined,
          role: role.trim() || undefined,
          clientId,
        })
      ).unwrap();
      dispatch(fetchTimeline(clientId));
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add person");
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setName("");
    setRole("");
    setEmail("");
    setPhone("");
    setLocation("");
    setError("");
    onClose();
  };

  return (
    <div className="modal-overlay" data-testid="add-person-modal" onClick={resetAndClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Person</h2>
          <button className="modal-close" onClick={resetAndClose} type="button" data-testid="add-person-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-error" data-testid="add-person-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              className="form-input"
              data-testid="add-person-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter person's name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role / Title</label>
            <input
              className="form-input"
              data-testid="add-person-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., VP of Engineering"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              data-testid="add-person-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                data-testid="add-person-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                data-testid="add-person-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="add-person-cancel"
            onClick={resetAndClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn--primary"
            data-testid="add-person-submit"
            onClick={handleSubmit}
            disabled={saving}
            type="button"
          >
            {saving ? "Adding..." : "Add Person"}
          </button>
        </div>
      </div>
    </div>
  );
}
