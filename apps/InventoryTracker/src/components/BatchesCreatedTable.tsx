import { useNavigate } from "react-router-dom";
import type { BatchCreated } from "../types";

interface BatchesCreatedTableProps {
  batches: BatchCreated[];
}

export function BatchesCreatedTable({ batches }: BatchesCreatedTableProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="batches-created-section">
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            <svg
              className="section-card-title-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Batches Created
          </h2>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          {batches.length === 0 ? (
            <div data-testid="batches-created-empty" className="empty-state">
              <p className="empty-state-message">
                No batches were created in this transaction
              </p>
            </div>
          ) : (
            <table className="data-table" data-testid="batches-created-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Material</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr
                    key={batch.id}
                    data-testid={`batch-created-row-${batch.batch_id}`}
                  >
                    <td>
                      <a
                        className="link"
                        data-testid={`batch-id-link-${batch.batch_id}`}
                        href={`/batches/${batch.batch_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/batches/${batch.batch_id}`);
                        }}
                      >
                        {batch.batch_id}
                      </a>
                    </td>
                    <td>
                      <a
                        className="link"
                        data-testid={`batch-material-link-${batch.batch_id}`}
                        href={`/materials/${batch.material_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/materials/${batch.material_id}`);
                        }}
                      >
                        {batch.material_name || batch.material_id}
                      </a>
                    </td>
                    <td>
                      <span data-testid={`batch-quantity-${batch.batch_id}`}>
                        {Number(batch.quantity).toFixed(2)}
                      </span>
                    </td>
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
