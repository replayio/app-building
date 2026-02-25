import { useState, useRef, useEffect } from "react";
import { Pagination } from "@shared/components/Pagination";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";
import type { Recipe, RecipeStatus } from "../types";
import { useAppDispatch } from "../hooks";
import { deleteRecipe, updateRecipe } from "../slices/recipesSlice";

const PAGE_SIZE = 5;

interface RecipesTableProps {
  items: Recipe[];
  selectedRecipeId: string | null;
  onSelectRecipe: (id: string | null) => void;
}

export function RecipesTable({
  items,
  selectedRecipeId,
  onSelectRecipe,
}: RecipesTableProps) {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<Recipe | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(startIndex, startIndex + PAGE_SIZE);

  const handleDelete = async () => {
    if (deletingId) {
      if (selectedRecipeId === deletingId) {
        onSelectRecipe(null);
      }
      await dispatch(deleteRecipe(deletingId));
      setDeletingId(null);
    }
  };

  const statusBadgeClass = (status: string) => {
    return `badge badge--${status.toLowerCase()}`;
  };

  const versionDisplay = (recipe: Recipe) => {
    if (recipe.status === "Draft") {
      return `${recipe.version} (Draft)`;
    }
    return recipe.version;
  };

  return (
    <div data-testid="recipes-table-container">
      <div className="section-card">
        <table className="data-table" data-testid="recipes-table">
          <thead>
            <tr>
              <th>Recipe Name</th>
              <th>Product</th>
              <th>Version</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <p className="empty-state-message">No recipes found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((recipe) => (
                <tr
                  key={recipe.id}
                  className={`clickable${
                    selectedRecipeId === recipe.id ? " selected" : ""
                  }`}
                  data-testid={`recipe-row-${recipe.id}`}
                  onClick={() => onSelectRecipe(recipe.id)}
                >
                  <td data-testid={`recipe-name-${recipe.id}`}>
                    {recipe.name}
                  </td>
                  <td data-testid={`recipe-product-${recipe.id}`}>
                    {recipe.product}
                  </td>
                  <td data-testid={`recipe-version-${recipe.id}`}>
                    {versionDisplay(recipe)}
                  </td>
                  <td data-testid={`recipe-status-${recipe.id}`}>
                    <span className={statusBadgeClass(recipe.status)}>
                      {recipe.status}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", gap: 4 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn-ghost"
                        data-testid={`recipe-edit-btn-${recipe.id}`}
                        onClick={() => setEditingItem(recipe)}
                        aria-label={`Edit ${recipe.name}`}
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
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn-danger"
                        data-testid={`recipe-delete-btn-${recipe.id}`}
                        onClick={() => setDeletingId(recipe.id)}
                        aria-label={`Delete ${recipe.name}`}
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
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
      {editingItem && (
        <EditRecipeModal
          recipe={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={async (data) => {
            await dispatch(updateRecipe({ id: editingItem.id, ...data }));
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

interface EditRecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onSubmit: (data: Partial<Recipe>) => Promise<void>;
}

function EditRecipeModal({ recipe, onClose, onSubmit }: EditRecipeModalProps) {
  const [name, setName] = useState(recipe.name);
  const [product, setProduct] = useState(recipe.product);
  const [version, setVersion] = useState(recipe.version);
  const [status, setStatus] = useState<RecipeStatus>(recipe.status);
  const [submitting, setSubmitting] = useState(false);

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
      data-testid="edit-recipe-modal"
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Recipe</h2>
          <button
            className="modal-close-btn"
            data-testid="edit-recipe-modal-close"
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
            data-testid="edit-recipe-name-input"
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
            data-testid="edit-recipe-product-input"
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
              data-testid="edit-recipe-version-input"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <EditStatusDropdown status={status} onChange={setStatus} />
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            data-testid="edit-recipe-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            data-testid="edit-recipe-submit-btn"
            disabled={!name.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditStatusDropdown({
  status,
  onChange,
}: {
  status: RecipeStatus;
  onChange: (s: RecipeStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="btn-secondary"
        data-testid="edit-recipe-status-select"
        style={{ width: "100%", justifyContent: "space-between" }}
        onClick={() => setOpen(!open)}
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
      {open && (
        <div
          className="calendar-filter-dropdown"
          data-testid="edit-recipe-status-dropdown"
        >
          {(["Active", "Draft", "Archived"] as RecipeStatus[]).map((s) => (
            <button
              key={s}
              className={`calendar-filter-option${
                status === s ? " calendar-filter-option--active" : ""
              }`}
              data-testid={`edit-recipe-status-option-${s.toLowerCase()}`}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
