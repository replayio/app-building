import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { createContact } from "../contactsSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
}

interface ClientOption {
  id: string;
  name: string;
}

export function AddContactModal({ open, onClose }: AddContactModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/.netlify/functions/clients")
        .then((r) => r.json())
        .then((data: { id: string; name: string }[]) => {
          setClients(data.map((c) => ({ id: c.id, name: c.name })));
        })
        .catch(() => {
          // Ignore client loading errors
        });
    }
  }, [open]);

  if (!open) return null;

  const clientOptions = [
    { value: "", label: "None" },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await dispatch(
        createContact({
          name: name.trim(),
          title: title.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          location: location.trim() || undefined,
          clientId: clientId || undefined,
        })
      ).unwrap();
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setName("");
    setTitle("");
    setEmail("");
    setPhone("");
    setLocation("");
    setClientId("");
    setError("");
    onClose();
  };

  return (
    <div className="modal-overlay" data-testid="add-contact-modal" onClick={resetAndClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Contact</h2>
          <button className="modal-close" onClick={resetAndClose} type="button" data-testid="add-contact-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-error" data-testid="add-contact-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              className="form-input"
              data-testid="add-contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contact name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              data-testid="add-contact-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., VP of Sales"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              data-testid="add-contact-email"
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
                data-testid="add-contact-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                data-testid="add-contact-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Associated Client</label>
            <FilterSelect
              options={clientOptions}
              value={clientId}
              onChange={setClientId}
              placeholder="Select a client (optional)"
              searchable
              testId="add-contact-client"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="add-contact-cancel"
            onClick={resetAndClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn--primary"
            data-testid="add-contact-submit"
            onClick={handleSubmit}
            disabled={saving}
            type="button"
          >
            {saving ? "Adding..." : "Add Contact"}
          </button>
        </div>
      </div>
    </div>
  );
}
