import { useState } from "react";
import type { Account } from "../types";
import { accountTypeLabel } from "../utils/accountTypeLabel";

interface EditAccountModalProps {
  account: Account;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
}

export function EditAccountModal({
  account,
  onClose,
  onSave,
}: EditAccountModalProps) {
  const [editName, setEditName] = useState(account.name);
  const [editDescription, setEditDescription] = useState(account.description);
  const [editError, setEditError] = useState("");

  const handleSave = async () => {
    if (!editName.trim()) {
      setEditError("Account Name is required");
      return;
    }
    await onSave(editName.trim(), editDescription.trim());
  };

  return (
    <div
      className="modal-overlay"
      data-testid="edit-account-modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        data-testid="edit-account-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Edit Account</h2>
          <button
            className="modal-close-btn"
            data-testid="edit-account-modal-close"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 18, height: 18 }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="form-group">
          <label className="form-label">Account Type</label>
          <input
            className="form-input"
            data-testid="edit-account-type"
            value={accountTypeLabel(account.account_type)}
            readOnly
            disabled
          />
        </div>
        <div className="form-group">
          <label className="form-label">Account Name</label>
          <input
            className="form-input"
            data-testid="edit-account-name"
            value={editName}
            onChange={(e) => {
              setEditName(e.target.value);
              setEditError("");
            }}
            placeholder="Enter account name"
          />
          {editError && (
            <p
              data-testid="edit-account-error"
              style={{
                color: "var(--status-error)",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {editError}
            </p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            data-testid="edit-account-description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Enter description"
          />
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            data-testid="edit-account-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            data-testid="edit-account-save-btn"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
