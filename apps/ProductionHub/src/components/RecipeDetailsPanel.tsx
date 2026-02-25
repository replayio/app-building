import { useState } from "react";
import type { RecipeMaterial } from "../types";

interface RecipeDetailData {
  id: string;
  name: string;
  product: string;
  version: string;
  status: string;
  description: string;
  instructions: string;
  materials: RecipeMaterial[];
}

interface RecipeDetailsPanelProps {
  recipe: RecipeDetailData;
  onClose: () => void;
}

type TabKey = "general" | "materials" | "instructions";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "general", label: "General Info" },
  { key: "materials", label: "Materials Breakdown" },
  { key: "instructions", label: "Instructions" },
];

export function RecipeDetailsPanel({
  recipe,
  onClose,
}: RecipeDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  const statusBadgeClass = `badge badge--${recipe.status.toLowerCase()}`;

  return (
    <div className="recipe-details-panel" data-testid="recipe-details-panel">
      <div className="recipe-panel-header">
        <h2
          className="recipe-panel-title"
          data-testid="recipe-panel-title"
        >
          Recipe Details: {recipe.name}
        </h2>
        <button
          className="modal-close-btn"
          data-testid="recipe-panel-close"
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

      <div className="recipe-panel-tabs" data-testid="recipe-panel-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`recipe-panel-tab${
              activeTab === tab.key ? " recipe-panel-tab--active" : ""
            }`}
            data-testid={`recipe-panel-tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="recipe-panel-body" data-testid="recipe-panel-body">
        {activeTab === "general" && (
          <GeneralInfoTab recipe={recipe} statusBadgeClass={statusBadgeClass} />
        )}
        {activeTab === "materials" && (
          <MaterialsBreakdownTab recipe={recipe} />
        )}
        {activeTab === "instructions" && (
          <InstructionsTab instructions={recipe.instructions} />
        )}
      </div>
    </div>
  );
}

function GeneralInfoTab({
  recipe,
  statusBadgeClass,
}: {
  recipe: RecipeDetailData;
  statusBadgeClass: string;
}) {
  return (
    <div data-testid="recipe-panel-general-info">
      <div className="detail-field">
        <span className="detail-field-label">Recipe Name</span>
        <span className="detail-field-value" data-testid="recipe-panel-general-name">
          {recipe.name}
        </span>
      </div>
      <div className="detail-field">
        <span className="detail-field-label">Product</span>
        <span className="detail-field-value" data-testid="recipe-panel-general-product">
          {recipe.product}
        </span>
      </div>
      <div className="detail-field">
        <span className="detail-field-label">Version</span>
        <span className="detail-field-value" data-testid="recipe-panel-general-version">
          {recipe.version}
        </span>
      </div>
      <div className="detail-field">
        <span className="detail-field-label">Status</span>
        <span className="detail-field-value" data-testid="recipe-panel-general-status">
          <span className={statusBadgeClass}>{recipe.status}</span>
        </span>
      </div>
    </div>
  );
}

function MaterialsBreakdownTab({ recipe }: { recipe: RecipeDetailData }) {
  return (
    <div data-testid="recipe-panel-materials">
      {recipe.materials.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-message">No materials defined for this recipe.</p>
        </div>
      ) : (
        <>
          <table className="data-table" data-testid="recipe-materials-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Quantity (per unit)</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {recipe.materials.map((m) => (
                <tr key={m.id} data-testid={`recipe-material-row-${m.id}`}>
                  <td data-testid={`recipe-material-name-${m.id}`}>
                    {m.material_name}
                  </td>
                  <td data-testid={`recipe-material-qty-${m.id}`}>
                    {m.quantity}
                  </td>
                  <td data-testid={`recipe-material-unit-${m.id}`}>
                    {m.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="recipe-panel-notes-section" data-testid="recipe-panel-notes-section">
            <h3 className="recipe-panel-notes-title">Notes &amp; Instructions</h3>
            {recipe.instructions ? (
              <p
                className="description-text"
                data-testid="recipe-panel-notes-text"
              >
                {recipe.instructions}
              </p>
            ) : (
              <p
                className="description-text"
                style={{ color: "var(--text-disabled)" }}
                data-testid="recipe-panel-notes-empty"
              >
                No notes or instructions available.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function InstructionsTab({ instructions }: { instructions: string }) {
  return (
    <div data-testid="recipe-panel-instructions">
      {instructions ? (
        <p className="description-text" data-testid="recipe-panel-instructions-text">
          {instructions}
        </p>
      ) : (
        <div className="empty-state">
          <p className="empty-state-message" data-testid="recipe-panel-instructions-empty">
            No instructions available for this recipe.
          </p>
        </div>
      )}
    </div>
  );
}
