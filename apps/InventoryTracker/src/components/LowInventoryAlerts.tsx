import { useNavigate } from "react-router-dom";
import type { LowInventoryAlert } from "../types";

interface LowInventoryAlertsProps {
  alerts: LowInventoryAlert[];
  onDismiss: (materialId: string) => void;
}

export function LowInventoryAlerts({ alerts, onDismiss }: LowInventoryAlertsProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="low-inventory-alerts" className="section-card">
      <div className="section-card-header">
        <div data-testid="low-inventory-alerts-heading" className="section-card-title">
          <svg
            data-testid="low-inventory-alerts-icon"
            className="section-card-title-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--status-warning)" }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Low Inventory Alerts
        </div>
      </div>
      <div className="section-card-body">
        {alerts.length === 0 ? (
          <div data-testid="low-inventory-alerts-empty" className="empty-state">
            <p className="empty-state-message">No low inventory alerts</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Material</th>
                <th>Current Qty</th>
                <th>Reorder Point</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr
                  key={alert.material_id}
                  data-testid={`low-inventory-alert-row-${alert.material_id}`}
                >
                  <td>
                    <span
                      data-testid={`low-inventory-alert-severity-${alert.material_id}`}
                      className={`badge badge--${alert.severity}`}
                    >
                      <svg
                        data-testid={`low-inventory-alert-severity-icon-${alert.material_id}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: 14, height: 14, marginRight: 4 }}
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span data-testid={`low-inventory-alert-severity-label-${alert.material_id}`}>
                        {alert.severity === "critical" ? "Critical" : "Warning"}
                      </span>
                    </span>
                  </td>
                  <td>
                    <span data-testid={`low-inventory-alert-material-name-${alert.material_id}`}>
                      {alert.material_name}
                    </span>
                  </td>
                  <td>
                    <span data-testid={`low-inventory-alert-current-qty-${alert.material_id}`}>
                      {alert.current_quantity.toLocaleString()} {alert.unit}
                    </span>
                  </td>
                  <td>
                    <span data-testid={`low-inventory-alert-reorder-point-${alert.material_id}`}>
                      {alert.reorder_point.toLocaleString()} {alert.unit}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <a
                        data-testid={`low-inventory-alert-view-details-${alert.material_id}`}
                        className="link"
                        href={`/materials/${alert.material_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/materials/${alert.material_id}`);
                        }}
                      >
                        View Details &gt;
                      </a>
                      <button
                        data-testid={`low-inventory-alert-dismiss-${alert.material_id}`}
                        className="btn-ghost"
                        onClick={() => onDismiss(alert.material_id)}
                      >
                        Dismiss
                      </button>
                      <button
                        data-testid={`low-inventory-alert-reorder-${alert.material_id}`}
                        className="btn-secondary"
                        onClick={() =>
                          navigate(`/transactions/new?material=${encodeURIComponent(alert.material_name)}&material_id=${alert.material_id}`)
                        }
                      >
                        Reorder
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
