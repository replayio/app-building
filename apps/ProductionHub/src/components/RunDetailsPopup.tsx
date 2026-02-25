import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchRunById, clearCurrentRun } from "../slices/runsSlice";
import type { ProductionRun, RunStatus, RunForecast, RecipeMaterial } from "../types";

interface RunDetailsPopupProps {
  run: ProductionRun;
  onClose: () => void;
}

function formatPopupDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${month} ${day}, ${year} ${String(h12).padStart(2, "0")}:${minutes} ${ampm}`;
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

export function RunDetailsPopup({ run, onClose }: RunDetailsPopupProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentRun = useAppSelector((s) => s.runs.currentRun);

  useEffect(() => {
    dispatch(fetchRunById(run.id));
    return () => {
      dispatch(clearCurrentRun());
    };
  }, [dispatch, run.id]);

  const detail = currentRun?.id === run.id ? currentRun : null;
  const product = run.product_name || "Unknown";
  const recipe = run.recipe_name || "No Recipe";
  const title = `Run Details: ${product} (${recipe})`;

  return (
    <div
      className="run-popup-overlay"
      data-testid="run-details-popup-overlay"
      onClick={onClose}
    >
      <div
        className="run-popup-content"
        data-testid="run-details-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="run-popup-title" data-testid="run-popup-title">
          {title}
        </h2>

        <div className="run-popup-field" data-testid="run-popup-start">
          <span className="run-popup-label">Start:</span>
          <span className="run-popup-value">{formatPopupDateTime(run.start_date)}</span>
        </div>

        <div className="run-popup-field" data-testid="run-popup-end">
          <span className="run-popup-label">End:</span>
          <span className="run-popup-value">{formatPopupDateTime(run.end_date)}</span>
        </div>

        <div className="run-popup-field" data-testid="run-popup-quantity">
          <span className="run-popup-label">Quantity:</span>
          <span className="run-popup-value">
            {parseFloat(String(run.planned_quantity))} {run.unit}
          </span>
        </div>

        <div className="run-popup-field" data-testid="run-popup-status">
          <span className="run-popup-label">Status:</span>
          <span className="run-popup-value">
            <span className={getStatusBadgeClass(run.status)}>{run.status}</span>
          </span>
        </div>

        <div className="run-popup-materials" data-testid="run-popup-materials">
          <div className="run-popup-materials-title">Materials:</div>
          {detail && detail.forecasts.length > 0 ? (
            detail.forecasts.map((f: RunForecast) => {
              const isOk = f.forecast_available >= f.required_amount;
              return (
                <div
                  key={f.id}
                  className="run-popup-material-item"
                  data-testid={`run-popup-material-${f.material_name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="run-popup-material-name">
                    {f.material_name} ({f.required_amount} {f.unit})
                  </span>
                  <span
                    className={`run-popup-material-status ${isOk ? "run-popup-material-status--ok" : "run-popup-material-status--shortage"}`}
                  >
                    {isOk ? "OK for all" : "Shortage"}
                  </span>
                </div>
              );
            })
          ) : detail && detail.materials.length > 0 ? (
            detail.materials.map((m: RecipeMaterial) => (
              <div
                key={m.id}
                className="run-popup-material-item"
                data-testid={`run-popup-material-${m.material_name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span className="run-popup-material-name">
                  {m.material_name} ({m.quantity} {m.unit})
                </span>
                <span className="run-popup-material-status run-popup-material-status--ok">
                  OK for all
                </span>
              </div>
            ))
          ) : (
            <div
              style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 0" }}
              data-testid="run-popup-no-materials"
            >
              No materials data available
            </div>
          )}
        </div>

        <div className="run-popup-field" style={{ borderBottom: "none" }} data-testid="run-popup-notes">
          <span className="run-popup-label">Notes:</span>
          <span className="run-popup-value">
            {run.notes || <span style={{ color: "var(--text-disabled)" }}>No notes</span>}
          </span>
        </div>

        <div className="run-popup-actions">
          <button
            className="btn-primary"
            data-testid="run-popup-edit-btn"
            onClick={() => navigate(`/runs/${run.id}`)}
          >
            Edit Run
          </button>
          <button
            className="btn-secondary"
            data-testid="run-popup-close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
