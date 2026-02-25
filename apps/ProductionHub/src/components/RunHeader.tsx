import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import type { RunDetail, RunStatus } from "../types";

interface RunHeaderProps {
  run: RunDetail;
}

function getStatusBadgeClass(status: RunStatus): string {
  switch (status) {
    case "Scheduled":
      return "badge badge--scheduled";
    case "Confirmed":
      return "badge badge--confirmed";
    case "Cancelled":
      return "badge badge--cancelled";
    case "On Track":
      return "badge badge--on-track";
    case "Material Shortage":
      return "badge badge--material-shortage";
    case "In Progress":
      return "badge badge--in-progress";
    case "Pending Approval":
      return "badge badge--pending-approval";
    case "Completed":
      return "badge badge--confirmed";
    default:
      return "badge";
  }
}

function formatRunDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${year}-${month}-${day} ${String(h12).padStart(2, "0")}:${minutes} ${ampm}`;
}

export function RunHeader({ run }: RunHeaderProps) {
  const navigate = useNavigate();

  const recipeDisplay = run.recipe_name
    ? `${run.recipe_name} (${run.product_name || ""})`
    : "—";

  return (
    <div data-testid="run-header">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: "Runs", onClick: () => navigate("/calendar") },
          { label: run.id },
        ]}
      />
      <div
        data-testid="run-detail-title-row"
        style={{
          padding: "20px 24px 0",
        }}
      >
        <h1 data-testid="run-detail-title" className="page-title">
          Run Details: {run.id}
        </h1>
      </div>

      <div className="page-content" style={{ paddingBottom: 0 }}>
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">High-Level Information</span>
          </div>
          <div className="section-card-body" data-testid="run-info-card">
            <div className="run-info-grid">
              <div className="detail-field">
                <span className="detail-field-label">Run ID:</span>
                <span className="detail-field-value" data-testid="run-info-id">
                  {run.id}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Date/Time:</span>
                <span
                  className="detail-field-value"
                  data-testid="run-info-datetime"
                >
                  {formatRunDateTime(run.start_date)}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Product:</span>
                <span
                  className="detail-field-value"
                  data-testid="run-info-product"
                >
                  {run.product_name || "—"}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Associated Recipe:</span>
                <span
                  className="detail-field-value"
                  data-testid="run-info-recipe"
                >
                  {recipeDisplay}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Planned Quantity:</span>
                <span
                  className="detail-field-value"
                  data-testid="run-info-quantity"
                >
                  {run.planned_quantity} {run.unit}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Status:</span>
                <span className="detail-field-value" data-testid="run-info-status">
                  <span className={getStatusBadgeClass(run.status)}>
                    {run.status}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
