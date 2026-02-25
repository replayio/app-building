import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { updateDeal } from "../dealsSlice";
import type { Deal, DealUser } from "../dealsSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

interface EditDealModalProps {
  open: boolean;
  onClose: () => void;
  deal: Deal | null;
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
  { value: "Won", label: "Won" },
  { value: "Lost", label: "Lost" },
];

export function EditDealModal({ open, onClose, deal, users }: EditDealModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [stage, setStage] = useState("Discovery");
  const [value, setValue] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [probability, setProbability] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (deal) {
      setName(deal.name);
      setStage(deal.stage);
      setValue(deal.value != null ? String(deal.value) : "");
      setOwnerId(deal.ownerId || "");
      setProbability(deal.probability != null ? String(deal.probability) : "");
      setExpectedCloseDate(deal.expectedCloseDate || "");
      setStatus(deal.status);
    }
  }, [deal]);

  if (!open || !deal) return null;

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Deal name is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await dispatch(
        updateDeal({
          dealId: deal.id,
          data: {
            name: name.trim(),
            value: value ? parseFloat(value) : undefined,
            stage,
            ownerId: ownerId || undefined,
            probability: probability ? parseInt(probability, 10) : undefined,
            expectedCloseDate: expectedCloseDate || undefined,
            status,
          },
        })
      ).unwrap();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update deal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="edit-deal-modal" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Deal</h2>
          <button className="modal-close" onClick={onClose} type="button" data-testid="edit-deal-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-error" data-testid="edit-deal-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Deal Name *</label>
            <input
              className="form-input"
              data-testid="edit-deal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter deal name"
            />
          </div>
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label">Stage</label>
              <FilterSelect
                options={STAGE_OPTIONS}
                value={stage}
                onChange={setStage}
                testId="edit-deal-stage"
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label">Value ($)</label>
              <input
                className="form-input"
                data-testid="edit-deal-value"
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
              testId="edit-deal-owner"
            />
          </div>
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label">Probability (%)</label>
              <input
                className="form-input"
                data-testid="edit-deal-probability"
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
                data-testid="edit-deal-close-date"
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
              testId="edit-deal-status"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="edit-deal-cancel"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn--primary"
            data-testid="edit-deal-submit"
            onClick={handleSubmit}
            disabled={saving}
            type="button"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
