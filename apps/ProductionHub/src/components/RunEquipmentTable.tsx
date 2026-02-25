import type { RunEquipmentItem } from "../types";

interface RunEquipmentTableProps {
  equipment: RunEquipmentItem[];
}

export function RunEquipmentTable({ equipment }: RunEquipmentTableProps) {
  return (
    <div data-testid="run-equipment-section">
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title" data-testid="run-equipment-heading">Equipment and Availability</span>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          {equipment.length === 0 ? (
            <div className="empty-state" data-testid="run-equipment-empty">
              <p className="empty-state-message">
                No equipment assigned to this run.
              </p>
            </div>
          ) : (
            <table className="data-table" data-testid="run-equipment-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((eq) => (
                  <tr key={eq.id} data-testid="run-equipment-row">
                    <td data-testid="equipment-name">{eq.equipment_name}</td>
                    <td data-testid="equipment-status">{eq.status}</td>
                    <td data-testid="equipment-notes">{eq.notes || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
