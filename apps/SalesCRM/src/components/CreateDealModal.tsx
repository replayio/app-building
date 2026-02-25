import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { createDeal } from "../dealsSlice";
import type { DealClient, DealUser } from "../dealsSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

interface CreateDealModalProps {
  open: boolean;
  onClose: () => void;
  clients: DealClient[];
  users: DealUser[];
}

const STAGE_OPTIONS = [
  { value: "Discovery", label: "Discovery" },
  { value: "Qualification", label: "Qualification" },
  { value: "Proposal Sent", label: "Proposal Sent" },
  { value: "Negotiation", label: "Negotiation" },
  { value: "Closed Won", label: "Closed Won" },
  { value: "Closed Lost", label: "Closed Lost" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "On Track", label: "On Track" },
  { value: "Needs Attention", label: "Needs Attention" },
  { value: "At Risk", label: "At Risk" },
];

export function CreateDealModal({ open, onClose, clients, users }: CreateDealModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [stage, setStage] = useState("Discovery");
  const [value, setValue] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [probability, setProbability] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const clientOptions = [
    { value: "", label: "Select client..." },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Deal name is required");
      return;
    }
    if (!clientId) {
      setError("Client is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await dispatch(
        createDeal({
          name: name.trim(),
          clientId,
          value: value ? parseFloat(value) : undefined,
          stage,
          ownerId: ownerId || undefined,
          probability: probability ? parseInt(probability, 10) : undefined,
          expectedCloseDate: expectedCloseDate || undefined,
          status,
        })
      ).unwrap();
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setName("");
    setClientId("");
    setStage("Discovery");
    setValue("");
    setOwnerId("");
    setProbability("");
    setExpectedCloseDate("");
    setStatus("active");
    setError("");
    onClose();
  };

  return (
    <div className="modal-overlay" data-testid="create-deal-modal" onClick={resetAndClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Deal</h2>
          <button className="modal-close" onClick={resetAndClose} type="button" data-testid="create-deal-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-error" data-testid="create-deal-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Deal Name *</label>
            <input
              className="form-input"
              data-testid="create-deal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter deal name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Client *</label>
            <FilterSelect
              options={clientOptions}
              value={clientId}
              onChange={setClientId}
              placeholder="Select client..."
              searchable
              testId="create-deal-client"
            />
          </div>
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label">Stage</label>
              <FilterSelect
                options={STAGE_OPTIONS}
                value={stage}
                onChange={setStage}
                testId="create-deal-stage"
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label">Value ($)</label>
              <input
                className="form-input"
                data-testid="create-deal-value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="25000"
                min="0"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Owner</label>
            <FilterSelect
              options={userOptions}
              value={ownerId}
              onChange={setOwnerId}
              placeholder="Select owner..."
              searchable
              testId="create-deal-owner"
            />
          </div>
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label">Probability (%)</label>
              <input
                className="form-input"
                data-testid="create-deal-probability"
                type="number"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                placeholder="50"
                min="0"
                max="100"
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label">Expected Close Date</label>
              <input
                className="form-input"
                data-testid="create-deal-close-date"
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <FilterSelect
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
              testId="create-deal-status"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="create-deal-cancel"
            onClick={resetAndClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn--primary"
            data-testid="create-deal-submit"
            onClick={handleSubmit}
            disabled={saving}
            type="button"
          >
            {saving ? "Creating..." : "Create Deal"}
          </button>
        </div>
      </div>
    </div>
  );
}
