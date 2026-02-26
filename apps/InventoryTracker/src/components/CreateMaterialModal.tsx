import { useState } from "react";
import { FilterSelect } from "@shared/components/FilterSelect";

interface CreateMaterialModalProps {
  categoryOptions: { value: string; label: string }[];
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category_id: string;
    unit_of_measure: string;
    description: string;
  }) => Promise<void>;
}

export function CreateMaterialModal({
  categoryOptions,
  onClose,
  onSubmit,
}: CreateMaterialModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const validationErrors: Record<string, string> = {};
    if (!name.trim()) validationErrors.name = "Material Name is required";
    if (!categoryId) validationErrors.category = "Category is required";
    if (!unit.trim()) validationErrors.unit = "Unit of Measure is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onSubmit({
      name: name.trim(),
      category_id: categoryId,
      unit_of_measure: unit.trim(),
      description: description.trim(),
    });
  };

  return (
    <div
      className="modal-overlay"
      data-testid="create-material-modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        data-testid="create-material-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Create Material</h2>
          <button
            className="modal-close-btn"
            data-testid="create-material-modal-close"
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
          <label className="form-label">Material Name</label>
          <input
            className="form-input"
            data-testid="create-material-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="Enter material name"
          />
          {errors.name && (
            <p
              data-testid="create-material-name-error"
              style={{
                color: "var(--status-error)",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {errors.name}
            </p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <FilterSelect
            options={categoryOptions}
            value={categoryId}
            onChange={(v) => {
              setCategoryId(v);
              setErrors((prev) => ({ ...prev, category: "" }));
            }}
            placeholder="Select category"
            testId="create-material-category"
          />
          {errors.category && (
            <p
              data-testid="create-material-category-error"
              style={{
                color: "var(--status-error)",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {errors.category}
            </p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Unit of Measure</label>
          <input
            className="form-input"
            data-testid="create-material-unit"
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setErrors((prev) => ({ ...prev, unit: "" }));
            }}
            placeholder="Enter unit of measure"
          />
          {errors.unit && (
            <p
              data-testid="create-material-unit-error"
              style={{
                color: "var(--status-error)",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {errors.unit}
            </p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            data-testid="create-material-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            data-testid="create-material-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            data-testid="create-material-submit-btn"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
