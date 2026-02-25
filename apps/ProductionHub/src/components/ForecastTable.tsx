import type { RunForecast } from "../types";

interface ForecastTableProps {
  forecasts: RunForecast[];
}

export function ForecastTable({ forecasts }: ForecastTableProps) {
  return (
    <div data-testid="forecast-section">
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">Forecast/Availability</span>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          {forecasts.length === 0 ? (
            <div className="empty-state" data-testid="forecast-empty">
              <p className="empty-state-message">
                No forecast data available for this run.
              </p>
            </div>
          ) : (
            <table className="data-table" data-testid="forecast-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Required Amount</th>
                  <th>Forecast Available</th>
                  <th>Shortage/Excess</th>
                  <th>Pending Deliveries</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f) => {
                  const required = Number(f.required_amount);
                  const available = Number(f.forecast_available);
                  const diff = available - required;
                  const isShortage = diff < 0;
                  const isSurplus = diff > 0;
                  const diffDisplay =
                    diff > 0
                      ? `+${diff % 1 === 0 ? diff : diff.toFixed(2)} ${f.unit}`
                      : `${diff % 1 === 0 ? diff : diff.toFixed(2)} ${f.unit}`;

                  return (
                    <tr key={f.id} data-testid="forecast-row">
                      <td data-testid="forecast-material">{f.material_name}</td>
                      <td data-testid="forecast-required">
                        {required % 1 === 0 ? required : required.toFixed(2)}{" "}
                        {f.unit}
                      </td>
                      <td data-testid="forecast-available">
                        {available % 1 === 0 ? available : available.toFixed(2)}{" "}
                        {f.unit}
                      </td>
                      <td data-testid="forecast-shortage-excess">
                        <span
                          className={
                            isSurplus
                              ? "forecast-surplus"
                              : isShortage
                                ? "forecast-shortage"
                                : ""
                          }
                        >
                          {diffDisplay}
                        </span>
                      </td>
                      <td data-testid="forecast-pending">
                        {f.pending_delivery || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
