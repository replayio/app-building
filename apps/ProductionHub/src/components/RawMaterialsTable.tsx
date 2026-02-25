import type { RecipeMaterial } from "../types";

interface RawMaterialsTableProps {
  materials: RecipeMaterial[];
  plannedQuantity: number;
}

export function RawMaterialsTable({
  materials,
  plannedQuantity,
}: RawMaterialsTableProps) {
  return (
    <div data-testid="raw-materials-section">
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title" data-testid="raw-materials-heading">Recipe and Raw Materials</span>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          {materials.length === 0 ? (
            <div className="empty-state" data-testid="raw-materials-empty">
              <p className="empty-state-message">
                No raw materials defined for this recipe.
              </p>
            </div>
          ) : (
            <table className="data-table" data-testid="raw-materials-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Amount Needed</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const amountNeeded = Number(m.quantity) * plannedQuantity;
                  return (
                    <tr key={m.id} data-testid="raw-material-row">
                      <td data-testid="material-name">{m.material_name}</td>
                      <td data-testid="material-amount">
                        {amountNeeded % 1 === 0
                          ? amountNeeded
                          : amountNeeded.toFixed(2)}
                      </td>
                      <td data-testid="material-unit">{m.unit}</td>
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
