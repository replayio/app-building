import { useState, useRef, useEffect } from "react";
import type { Recipe, RecipeStatus } from "../types";
import { useAppDispatch } from "../hooks";
import { createRecipe } from "../slices/recipesSlice";

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "Active", value: "Active" },
  { label: "Draft", value: "Draft" },
  { label: "Archived", value: "Archived" },
];

interface RecipesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export function RecipesHeader({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: RecipesHeaderProps) {
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const selectedLabel =
    STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All";

  return (
    <div data-testid="recipes-header">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 className="page-title" data-testid="recipes-page-title">
            Recipes
          </h1>
          <span
            style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}
            data-testid="recipes-page-route"
          >
            /recipes
          </span>
        </div>
      </div>

      <div
        className="recipes-controls"
        data-testid="recipes-controls"
      >
        <div className="recipes-search-wrapper">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: 10, top: 10, pointerEvents: "none" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="form-input"
            data-testid="recipes-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or product..."
            style={{ paddingLeft: 34 }}
          />
        </div>

        <div
          className="calendar-filter-wrapper"
          ref={dropdownRef}
          data-testid="recipes-status-filter"
        >
          <button
            className="btn-secondary"
            data-testid="recipes-status-filter-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Filter Status: {selectedLabel === "All" ? "(All)" : selectedLabel}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: 4 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dropdownOpen && (
            <div
              className="calendar-filter-dropdown"
              data-testid="recipes-status-dropdown"
            >
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`calendar-filter-option${
                    statusFilter === option.value
                      ? " calendar-filter-option--active"
                      : ""
                  }`}
                  data-testid={`recipes-status-option-${option.label.toLowerCase()}`}
                  onClick={() => {
                    onStatusFilterChange(option.value);
                    setDropdownOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn-primary"
          data-testid="add-recipe-btn"
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
          <span className="btn-text">Add Recipe</span>
        </button>
      </div>

      {showModal && (
        <AddRecipeModal
          onClose={() => setShowModal(false)}
          onSubmit={async (data) => {
            await dispatch(createRecipe(data));
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

interface AddRecipeModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Recipe>) => Promise<void>;
}

function AddRecipeModal({ onClose, onSubmit }: AddRecipeModalProps) {
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");
  const [version, setVersion] = useState("");
  const [status, setStatus] = useState<RecipeStatus>("Draft");
  const [submitting, setSubmitting] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    if (statusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [statusDropdownOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    await onSubmit({
      name: name.trim(),
      product: product.trim(),
      version: version.trim(),
      status,
    });
    setSubmitting(false);
  };

  return (
    <div
      className="modal-overlay"
      data-testid="add-recipe-modal"
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Recipe</h2>
          <button
            className="modal-close-btn"
            data-testid="add-recipe-modal-close"
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
          <label className="form-label">Recipe Name</label>
          <input
            className="form-input"
            data-testid="add-recipe-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recipe name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Product</label>
          <input
            className="form-input"
            data-testid="add-recipe-product-input"
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Product name"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Version</label>
            <input
              className="form-input"
              data-testid="add-recipe-version-input"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <div
              ref={statusRef}
              style={{ position: "relative" }}
            >
              <button
                className="btn-secondary"
                data-testid="add-recipe-status-select"
                style={{ width: "100%", justifyContent: "space-between" }}
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                type="button"
              >
                {status}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {statusDropdownOpen && (
                <div
                  className="calendar-filter-dropdown"
                  data-testid="add-recipe-status-dropdown"
                >
                  {(["Active", "Draft", "Archived"] as RecipeStatus[]).map(
                    (s) => (
                      <button
                        key={s}
                        className={`calendar-filter-option${
                          status === s ? " calendar-filter-option--active" : ""
                        }`}
                        data-testid={`add-recipe-status-option-${s.toLowerCase()}`}
                        onClick={() => {
                          setStatus(s);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            data-testid="add-recipe-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            data-testid="add-recipe-submit-btn"
            disabled={!name.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Adding..." : "Add Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
