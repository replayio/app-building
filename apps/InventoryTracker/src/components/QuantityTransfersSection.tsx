import { useState } from "react";
import { SearchableSelect } from "@shared/components/SearchableSelect";
import type { Account } from "../types";

const UNIT_OPTIONS = ["unit", "kg", "m", "L", "g", "lb", "oz", "ft"];

export interface TransferRow {
  id: string;
  sourceAccountId: string;
  sourceAccountName: string;
  destinationAccountId: string;
  destinationAccountName: string;
  amount: number;
  unit: string;
  sourceBatchId: string;
}

interface QuantityTransfersSectionProps {
  transfers: TransferRow[];
  onTransfersChange: (transfers: TransferRow[]) => void;
  accounts: Account[];
  errors?: string;
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
  return `qt-${Date.now()}-${nextId++}`;
}

export function QuantityTransfersSection({
  transfers,
  onTransfersChange,
  accounts,
  errors,
}: QuantityTransfersSectionProps) {
  const [newSourceAccountId, setNewSourceAccountId] = useState("");
  const [newDestAccountId, setNewDestAccountId] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newUnit, setNewUnit] = useState("unit");
  const [newSourceBatchId, setNewSourceBatchId] = useState("");
  const [unitOpen, setUnitOpen] = useState(false);

  const accountOptions = accounts
    .filter((a) => a.status === "active")
    .map((a) => ({
      id: a.id,
      label: `${a.name} (${a.id.slice(0, 4)})`,
    }));

  const handleAdd = () => {
    const amount = parseFloat(newAmount);
    if (!newSourceAccountId || !newDestAccountId || isNaN(amount) || amount <= 0) return;

    const srcAccount = accounts.find((a) => a.id === newSourceAccountId);
    const destAccount = accounts.find((a) => a.id === newDestAccountId);

    const row: TransferRow = {
      id: generateId(),
      sourceAccountId: newSourceAccountId,
      sourceAccountName: srcAccount
        ? `${srcAccount.name} (${srcAccount.id.slice(0, 4)})`
        : newSourceAccountId,
      destinationAccountId: newDestAccountId,
      destinationAccountName: destAccount
        ? `${destAccount.name} (${destAccount.id.slice(0, 4)})`
        : newDestAccountId,
      amount,
      unit: newUnit,
      sourceBatchId: newSourceBatchId,
    };

    onTransfersChange([...transfers, row]);
    setNewSourceAccountId("");
    setNewDestAccountId("");
    setNewAmount("");
    setNewUnit("unit");
    setNewSourceBatchId("");
  };

  const handleDelete = (id: string) => {
    onTransfersChange(transfers.filter((t) => t.id !== id));
  };

  return (
    <div data-testid="quantity-transfers-section">
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        2. Quantity Transfers
      </h2>
      {errors && (
        <div
          data-testid="error-transfers"
          style={{
            fontSize: 12,
            color: "var(--status-error)",
            marginBottom: 8,
          }}
        >
          {errors}
        </div>
      )}
      <div className="section-card" style={{ marginBottom: 0 }}>
        <div className="section-card-body" style={{ padding: 0 }}>
          <table className="data-table" data-testid="quantity-transfers-table">
            <thead>
              <tr>
                <th>Source Account</th>
                <th>Destination Account</th>
                <th>Amount</th>
                <th>Source Batch ID (Optional)</th>
                <th style={{ width: 48 }} />
              </tr>
            </thead>
            <tbody>
              {transfers.map((row) => (
                <tr key={row.id} data-testid={`transfer-row-${row.id}`}>
                  <td>{row.sourceAccountName}</td>
                  <td>{row.destinationAccountName}</td>
                  <td>
                    {row.amount} {row.unit}
                  </td>
                  <td>
                    {row.sourceBatchId ? (
                      row.sourceBatchId
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-danger"
                      data-testid={`delete-transfer-${row.id}`}
                      onClick={() => handleDelete(row.id)}
                      title="Remove transfer"
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
            data-testid="add-transfer-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto 1fr auto",
              gap: 8,
              padding: "12px 12px",
              borderTop:
                transfers.length > 0
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
                Source Account
              </span>
              <SearchableSelect
                options={accountOptions}
                value={newSourceAccountId}
                onChange={setNewSourceAccountId}
                placeholder="Select source..."
                testId="add-transfer-source-account"
              />
            </div>
            <div>
              <span
                className="form-label"
                style={{ fontSize: 11, marginBottom: 2 }}
              >
                Destination Account
              </span>
              <SearchableSelect
                options={accountOptions}
                value={newDestAccountId}
                onChange={setNewDestAccountId}
                placeholder="Select destination..."
                testId="add-transfer-dest-account"
              />
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
              <div>
                <span
                  className="form-label"
                  style={{ fontSize: 11, marginBottom: 2 }}
                >
                  Amount
                </span>
                <input
                  data-testid="add-transfer-amount"
                  type="number"
                  className="form-input"
                  style={{ width: 100 }}
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
              </div>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  className="custom-dropdown-trigger"
                  data-testid="add-transfer-unit-trigger"
                  style={{ height: 36, minWidth: 60 }}
                  onClick={() => setUnitOpen(!unitOpen)}
                >
                  {newUnit}
                  <svg
                    className="custom-dropdown-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {unitOpen && (
                  <div
                    className="custom-dropdown-menu"
                    data-testid="add-transfer-unit-dropdown"
                    style={{ minWidth: 80 }}
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        className={`custom-dropdown-item${u === newUnit ? " custom-dropdown-item--selected" : ""}`}
                        onClick={() => {
                          setNewUnit(u);
                          setUnitOpen(false);
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <span
                className="form-label"
                style={{ fontSize: 11, marginBottom: 2 }}
              >
                Source Batch ID
              </span>
              <input
                data-testid="add-transfer-source-batch-id"
                type="text"
                className="form-input"
                placeholder="Optional"
                value={newSourceBatchId}
                onChange={(e) => setNewSourceBatchId(e.target.value)}
              />
            </div>
            <div>
              <button
                type="button"
                className="btn-primary"
                data-testid="add-transfer-button"
                style={{ height: 36, whiteSpace: "nowrap" }}
                onClick={handleAdd}
              >
                + Add Quantity Transfer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
