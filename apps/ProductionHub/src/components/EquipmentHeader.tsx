import { useState } from "react";
import type { Equipment } from "../types";
import { useAppDispatch } from "../hooks";
import { createEquipment } from "../slices/equipmentSlice";

export function EquipmentHeader() {
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="page-header" data-testid="equipment-header">
      <div>
        <h1 className="page-title" data-testid="equipment-page-title">
          Equipment Inventory
        </h1>
        <p
          data-testid="equipment-page-subtitle"
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          Describes all the equipment available for production runs.
        </p>
      </div>
      <button
        className="btn-primary"
        data-testid="add-equipment-btn"
        onClick={() => setShowModal(true)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="btn-text">Add Equipment</span>
      </button>
      {showModal && (
        <AddEquipmentModal
          onClose={() => setShowModal(false)}
          onSubmit={async (data) => {
            await dispatch(createEquipment(data));
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

interface AddEquipmentModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Equipment>) => Promise<void>;
}

function AddEquipmentModal({ onClose, onSubmit }: AddEquipmentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [availableUnits, setAvailableUnits] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    await onSubmit({
      name: title.trim(),
      description: description.trim(),
      available_units: parseInt(availableUnits, 10) || 0,
    });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" data-testid="add-equipment-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Equipment</h2>
          <button
            className="modal-close-btn"
            data-testid="add-equipment-modal-close"
            onClick={onClose}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            data-testid="add-equipment-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Equipment name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            data-testid="add-equipment-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Equipment description"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Available Units</label>
          <input
            className="form-input"
            data-testid="add-equipment-units-input"
            type="number"
            min="0"
            value={availableUnits}
            onChange={(e) => setAvailableUnits(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            data-testid="add-equipment-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            data-testid="add-equipment-submit-btn"
            disabled={!title.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Adding..." : "Add Equipment"}
          </button>
        </div>
      </div>
    </div>
  );
}
