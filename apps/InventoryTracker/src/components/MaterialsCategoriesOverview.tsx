import { useNavigate } from "react-router-dom";
import type { CategoryOverview } from "../types";

interface MaterialsCategoriesOverviewProps {
  categoryOverviews: CategoryOverview[];
}

export function MaterialsCategoriesOverview({ categoryOverviews }: MaterialsCategoriesOverviewProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="materials-categories-overview" className="section-card">
      <div className="section-card-header">
        <div data-testid="materials-categories-overview-heading" className="section-card-title">
          <svg
            data-testid="materials-categories-overview-icon"
            className="section-card-title-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          Materials Categories Overview
        </div>
      </div>
      <div className="section-card-body">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {categoryOverviews.map((cat) => (
            <div
              key={cat.category_id}
              data-testid={`category-column-${cat.category_id}`}
              style={{
                flex: "1 1 200px",
                border: "1px solid var(--bg-border-color-light)",
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div data-testid={`category-col-name-${cat.category_id}`} style={{ fontWeight: 600, marginBottom: 4 }}>
                {cat.category_name}
              </div>
              <div
                data-testid={`category-col-totals-${cat.category_id}`}
                style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}
              >
                (Total: {cat.total_items.toLocaleString()} Items, {cat.total_quantity.toLocaleString()} Units)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cat.materials.map((material) => (
                  <div
                    key={material.id}
                    data-testid={`category-mat-${material.id}`}
                    style={{ fontSize: 13 }}
                  >
                    <a
                      data-testid={`category-material-link-${material.id}`}
                      className="link"
                      href={`/materials/${material.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/materials/${material.id}`);
                      }}
                    >
                      {material.name}
                    </a>
                    : {material.quantity.toLocaleString()} {material.unit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="section-card-footer">
        <a
          data-testid="view-all-categories-link"
          className="link"
          href="/materials"
          onClick={(e) => {
            e.preventDefault();
            navigate("/materials");
          }}
        >
          View All Categories
        </a>
      </div>
    </div>
  );
}
