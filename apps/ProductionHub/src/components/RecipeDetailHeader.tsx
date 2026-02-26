import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import { useAppDispatch } from "../hooks";
import { updateRecipe } from "../slices/recipesSlice";
import type { Recipe, RecipeMaterial, RecipeProduct, RecipeEquipment } from "../types";

interface RecipeWithRelations extends Recipe {
  materials: RecipeMaterial[];
  products: RecipeProduct[];
  equipment: RecipeEquipment[];
}

interface RecipeDetailHeaderProps {
  recipe: RecipeWithRelations;
}

export function RecipeDetailHeader({ recipe }: RecipeDetailHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showEditModal, setShowEditModal] = useState(false);

  const displayTitle = `${recipe.name} (${recipe.id})`;

  return (
    <div data-testid="recipe-detail-header">
      <Breadcrumb
        items={[
          {
            label: "Recipes",
            onClick: () => navigate("/recipes"),
          },
          {
            label: displayTitle,
          },
        ]}
      />
      <div
        data-testid="recipe-detail-title-row"
        className="detail-title-row"
      >
        <h1 data-testid="recipe-detail-title" className="page-title">
          {displayTitle}
        </h1>
        <button
          data-testid="edit-recipe-btn"
          className="btn-primary"
          onClick={() => setShowEditModal(true)}
        >
          Edit Recipe
        </button>
      </div>

      {showEditModal && (
        <EditRecipeModal
          recipe={recipe}
          onClose={() => setShowEditModal(false)}
          onSave={async (data) => {
            await dispatch(updateRecipe({ id: recipe.id, ...data }));
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

interface EditRecipeModalProps {
  recipe: RecipeWithRelations;
  onClose: () => void;
  onSave: (data: Partial<Recipe>) => Promise<void>;
}

function EditRecipeModal({ recipe, onClose, onSave }: EditRecipeModalProps) {
  const [name, setName] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description);
  const [product, setProduct] = useState(recipe.product);
  const [version, setVersion] = useState(recipe.version);
  const [status, setStatus] = useState(recipe.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ name, description, product, version, status });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="edit-recipe-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Recipe</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Recipe Name</label>
            <input
              data-testid="edit-recipe-name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              data-testid="edit-recipe-description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product</label>
              <input
                data-testid="edit-recipe-product"
                className="form-input"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Version</label>
              <input
                data-testid="edit-recipe-version"
                className="form-input"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="custom-select-container" style={{ position: "relative" }}>
              <StatusSelect value={status} onChange={setStatus} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !name.trim()}
              data-testid="edit-recipe-save"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "Active" | "Draft" | "Archived") => void;
}) {
  const [open, setOpen] = useState(false);
  const options: ("Active" | "Draft" | "Archived")[] = ["Active", "Draft", "Archived"];

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="form-input"
        data-testid="edit-recipe-status"
        onClick={() => setOpen(!open)}
        style={{
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{value}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--card-bg)",
            border: "1px solid var(--bg-border-color)",
            borderRadius: 4,
            boxShadow: "var(--shadow-elevation-1)",
            zIndex: 10,
            marginTop: 4,
          }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                fontSize: 13,
                cursor: "pointer",
                background: opt === value ? "var(--accent-subtle-bg)" : "transparent",
                color: "var(--text-primary)",
                transition: "background-color 0.1s ease",
              }}
              onMouseEnter={(e) => {
                if (opt !== value) (e.target as HTMLElement).style.background = "rgba(50, 45, 35, 0.05)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = opt === value ? "var(--accent-subtle-bg)" : "transparent";
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
