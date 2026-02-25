import type { RecipeMaterial } from "../types";

interface RawMaterialsCardProps {
  materials: RecipeMaterial[];
}

export function RawMaterialsCard({ materials }: RawMaterialsCardProps) {
  return (
    <div className="section-card" data-testid="raw-materials-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Raw Materials (per batch)</h2>
      </div>
      <div className="section-card-body" style={{ padding: 0 }}>
        {materials.length === 0 ? (
          <div className="empty-state" data-testid="materials-empty">
            <p className="empty-state-message">No raw materials defined.</p>
          </div>
        ) : (
          <table className="data-table" data-testid="materials-table">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} data-testid="material-row">
                  <td data-testid="material-name">{material.material_name}</td>
                  <td data-testid="material-amount">
                    {material.quantity} {material.unit}
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
