import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { createClient } from "../clientsSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

const TYPE_OPTIONS = [
  { value: "organization", label: "Organization" },
  { value: "individual", label: "Individual" },
];

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "churned", label: "Churned" },
];

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddClientModal({ open, onClose }: AddClientModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [type, setType] = useState("organization");
  const [status, setStatus] = useState("prospect");
  const [tags, setTags] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [sourceDetail, setSourceDetail] = useState("");
  const [campaign, setCampaign] = useState("");
  const [channel, setChannel] = useState("");
  const [dateAcquired, setDateAcquired] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function resetForm() {
    setName("");
    setType("organization");
    setStatus("prospect");
    setTags("");
    setSourceType("");
    setSourceDetail("");
    setCampaign("");
    setChannel("");
    setDateAcquired("");
    setError("");
    setSaving(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await dispatch(
        createClient({
          name: name.trim(),
          type,
          status,
          tags: tagList,
          sourceType: sourceType || undefined,
          sourceDetail: sourceDetail || undefined,
          campaign: campaign || undefined,
          channel: channel || undefined,
          dateAcquired: dateAcquired || undefined,
        })
      ).unwrap();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      data-testid="add-client-modal-overlay"
      onClick={handleClose}
    >
      <div
        className="modal"
        data-testid="add-client-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Add New Client</h3>
          <button
            className="modal-close"
            data-testid="add-client-modal-close"
            onClick={handleClose}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="modal-error" data-testid="add-client-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="client-name">Name *</label>
              <input
                id="client-name"
                className="form-input"
                data-testid="client-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client name"
              />
            </div>

            <div className="form-row">
              <div className="form-group form-group--half">
                <label className="form-label">Type</label>
                <FilterSelect
                  options={TYPE_OPTIONS}
                  value={type}
                  onChange={setType}
                  testId="client-type-select"
                />
              </div>
              <div className="form-group form-group--half">
                <label className="form-label">Status</label>
                <FilterSelect
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={setStatus}
                  testId="client-status-select"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="client-tags">Tags</label>
              <input
                id="client-tags"
                className="form-input"
                data-testid="client-tags-input"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma-separated tags (e.g., Enterprise, SaaS)"
              />
            </div>

            <div className="form-row">
              <div className="form-group form-group--half">
                <label className="form-label" htmlFor="client-source-type">Source Type</label>
                <input
                  id="client-source-type"
                  className="form-input"
                  data-testid="client-source-type-input"
                  type="text"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  placeholder="e.g., Referral, Website"
                />
              </div>
              <div className="form-group form-group--half">
                <label className="form-label" htmlFor="client-source-detail">Source Detail</label>
                <input
                  id="client-source-detail"
                  className="form-input"
                  data-testid="client-source-detail-input"
                  type="text"
                  value={sourceDetail}
                  onChange={(e) => setSourceDetail(e.target.value)}
                  placeholder="Additional source details"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group--half">
                <label className="form-label" htmlFor="client-campaign">Campaign</label>
                <input
                  id="client-campaign"
                  className="form-input"
                  data-testid="client-campaign-input"
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="Campaign name"
                />
              </div>
              <div className="form-group form-group--half">
                <label className="form-label" htmlFor="client-channel">Channel</label>
                <input
                  id="client-channel"
                  className="form-input"
                  data-testid="client-channel-input"
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="Acquisition channel"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="client-date-acquired">Date Acquired</label>
              <input
                id="client-date-acquired"
                className="form-input"
                data-testid="client-date-acquired-input"
                type="date"
                value={dateAcquired}
                onChange={(e) => setDateAcquired(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn--secondary"
              data-testid="add-client-cancel"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn--primary"
              data-testid="add-client-submit"
              disabled={saving}
              type="submit"
            >
              {saving ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
