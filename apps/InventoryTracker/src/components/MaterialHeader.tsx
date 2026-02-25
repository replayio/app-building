import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import type { Material } from "../types";

interface MaterialHeaderProps {
  material: Material;
  onEditMaterial: () => void;
  onNewBatch: () => void;
}

export function MaterialHeader({
  material,
  onEditMaterial,
  onNewBatch,
}: MaterialHeaderProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="material-header">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: "Materials", onClick: () => navigate("/materials") },
          { label: material.name },
        ]}
      />

      <div className="page-header" style={{ marginTop: 16 }}>
        <div>
          <h1 data-testid="material-name" className="page-title">
            {material.name}
          </h1>
          <div
            data-testid="material-meta"
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 8,
            }}
          >
            Category: {material.category_name || "—"} | Unit of Measure:{" "}
            {material.unit_of_measure}
          </div>
          {material.description && (
            <div
              data-testid="material-description"
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginTop: 8,
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              {material.description}
            </div>
          )}
        </div>
        <div className="page-header-actions">
          <button
            data-testid="edit-material-btn"
            className="btn-secondary"
            onClick={onEditMaterial}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 14, height: 14 }}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Material
          </button>
          <button
            data-testid="new-batch-btn"
            className="btn-primary"
            onClick={onNewBatch}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 14, height: 14 }}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Batch
          </button>
          <button
            data-testid="new-transaction-btn"
            className="btn-primary"
            onClick={() =>
              navigate(`/transactions/new?material_id=${material.id}`)
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 14, height: 14 }}
            >
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            New Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
