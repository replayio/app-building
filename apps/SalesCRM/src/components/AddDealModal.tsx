import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { createDeal, fetchTimeline, type UserItem } from "../clientDetailSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

interface AddDealModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  users: UserItem[];
}

const STAGE_OPTIONS = [
  { value: "Lead", label: "Lead" },
  { value: "Qualified", label: "Qualified" },
  { value: "Proposal", label: "Proposal" },
  { value: "Negotiation", label: "Negotiation" },
  { value: "Closed Won", label: "Closed Won" },
  { value: "Closed Lost", label: "Closed Lost" },
];

export function AddDealModal({ open, onClose, clientId, users }: AddDealModalProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [stage, setStage] = useState("Lead");
  const [value, setValue] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [probability, setProbability] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Deal name is required");
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
        })
      ).unwrap();
      dispatch(fetchTimeline(clientId));
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setName("");
    setStage("Lead");
    setValue("");
    setOwnerId("");
    setProbability("");
    setExpectedCloseDate("");
    setError("");
    onClose();
  };

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  return (
    <div className="modal-overlay" data-testid="add-deal-modal" onClick={resetAndClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Deal</h2>
          <button className="modal-close" onClick={resetAndClose} type="button" data-testid="add-deal-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-error" data-testid="add-deal-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Deal Name *</label>
            <input
              className="form-input"
              data-testid="add-deal-name"
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
                testId="add-deal-stage"
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label">Value ($)</label>
              <input
                className="form-input"
                data-testid="add-deal-value"
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
              testId="add-deal-owner"
            />
          </div>
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label">Probability (%)</label>
              <input
                className="form-input"
                data-testid="add-deal-probability"
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
                data-testid="add-deal-close-date"
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="add-deal-cancel"
            onClick={resetAndClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn--primary"
            data-testid="add-deal-submit"
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
