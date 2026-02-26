import { useState } from "react";

interface CreateCategoryModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
}

export function CreateCategoryModal({
  onClose,
  onSubmit,
}: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Category Name is required");
      return;
    }
    await onSubmit({
      name: name.trim(),
      description: "",
    });
  };

  return (
    <div
      className="modal-overlay"
      data-testid="create-category-modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        data-testid="create-category-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Create Category</h2>
          <button
            className="modal-close-btn"
            data-testid="create-category-modal-close"
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
          <label className="form-label">Category Name</label>
          <input
            className="form-input"
            data-testid="create-category-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Enter category name"
          />
          {error && (
            <p
              data-testid="create-category-error"
              style={{
                color: "var(--status-error)",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {error}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            data-testid="create-category-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            data-testid="create-category-submit-btn"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
