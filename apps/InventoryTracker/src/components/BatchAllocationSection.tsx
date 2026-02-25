import { useState } from "react";
import { SearchableSelect } from "@shared/components/SearchableSelect";
import type { Material } from "../types";

export interface BatchRow {
  id: string;
  materialId: string;
  materialName: string;
  amount: number;
  unit: string;
}

interface BatchAllocationSectionProps {
  batches: BatchRow[];
  onBatchesChange: (batches: BatchRow[]) => void;
  materials: Material[];
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16 }}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

let nextId = 1;
function generateId(): string {
  return `ba-${Date.now()}-${nextId++}`;
}

export function BatchAllocationSection({
  batches,
  onBatchesChange,
  materials,
}: BatchAllocationSectionProps) {
  const [newMaterialId, setNewMaterialId] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const materialOptions = materials.map((m) => ({
    id: m.id,
    label: m.name,
  }));

  const selectedMaterial = materials.find((m) => m.id === newMaterialId);

  const handleAdd = () => {
    const amount = parseFloat(newAmount);
    if (!newMaterialId || isNaN(amount) || amount <= 0) return;

    const mat = materials.find((m) => m.id === newMaterialId);

    const row: BatchRow = {
      id: generateId(),
      materialId: newMaterialId,
      materialName: mat ? mat.name : newMaterialId,
      amount,
      unit: mat ? mat.unit_of_measure : "unit",
    };

    onBatchesChange([...batches, row]);
    setNewMaterialId("");
    setNewAmount("");
  };

  const handleDelete = (id: string) => {
    onBatchesChange(batches.filter((b) => b.id !== id));
  };

  return (
    <div data-testid="batch-allocation-section">
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        3. Batch Allocation
      </h2>
      <div className="section-card" style={{ marginBottom: 0 }}>
        <div className="section-card-body" style={{ padding: 0 }}>
          <table className="data-table" data-testid="batch-allocation-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Amount</th>
                <th style={{ width: 48 }} />
              </tr>
            </thead>
            <tbody>
              {batches.map((row) => (
                <tr key={row.id} data-testid={`batch-row-${row.id}`}>
                  <td>{row.materialName}</td>
                  <td>
                    {row.amount} {row.unit}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-danger"
                      data-testid={`delete-batch-${row.id}`}
                      onClick={() => handleDelete(row.id)}
                      title="Remove batch"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Inline add row */}
          <div
            data-testid="add-batch-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 8,
              padding: "12px 12px",
              borderTop:
                batches.length > 0
                  ? "1px solid var(--bg-border-color-light)"
                  : "none",
              alignItems: "end",
            }}
          >
            <div>
              <span
                className="form-label"
                style={{ fontSize: 11, marginBottom: 2 }}
              >
                Material
              </span>
              <SearchableSelect
                options={materialOptions}
                value={newMaterialId}
                onChange={setNewMaterialId}
                placeholder="Select material..."
                testId="add-batch-material"
              />
            </div>
            <div>
              <span
                className="form-label"
                style={{ fontSize: 11, marginBottom: 2 }}
              >
                Amount
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  data-testid="add-batch-amount"
                  type="number"
                  className="form-input"
                  style={{ width: 120 }}
                  placeholder="0"
                  value={newAmount}
                  min="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setNewAmount(val);
                    }
                  }}
                />
                {selectedMaterial && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedMaterial.unit_of_measure}
                  </span>
                )}
              </div>
            </div>
            <div>
              <button
                type="button"
                className="btn-primary"
                data-testid="add-batch-button"
                style={{ height: 36, whiteSpace: "nowrap" }}
                onClick={handleAdd}
              >
                + Create New Batch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
