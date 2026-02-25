import { useNavigate } from "react-router-dom";
import type { AccountMaterial } from "../types";

interface TrackedMaterialsTableProps {
  materials: AccountMaterial[];
  accountId: string;
}

export function TrackedMaterialsTable({
  materials,
  accountId,
}: TrackedMaterialsTableProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="tracked-materials-section">
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
            Tracked Materials
          </h2>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          {materials.length === 0 ? (
            <div data-testid="tracked-materials-empty" className="empty-state">
              <p className="empty-state-message">
                No materials tracked in this account
              </p>
            </div>
          ) : (
            <table className="data-table" data-testid="tracked-materials-table">
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Category</th>
                  <th>Unit of Measure</th>
                  <th>Total Quantity</th>
                  <th>Number of Batches</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr
                    key={mat.material_id}
                    data-testid={`material-row-${mat.material_id}`}
                  >
                    <td>
                      <a
                        data-testid={`material-name-${mat.material_id}`}
                        className="link"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/materials/${mat.material_id}`);
                        }}
                        href={`/materials/${mat.material_id}`}
                      >
                        {mat.material_name}
                      </a>
                    </td>
                    <td>
                      <span data-testid={`material-category-${mat.material_id}`}>
                        {mat.category_name}
                      </span>
                    </td>
                    <td>
                      <span data-testid={`material-unit-${mat.material_id}`}>
                        {mat.unit_of_measure}
                      </span>
                    </td>
                    <td>
                      <span data-testid={`material-quantity-${mat.material_id}`}>
                        {formatQuantity(mat.total_quantity)}{" "}
                        {mat.unit_of_measure}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-disabled)",
                          marginLeft: 4,
                        }}
                      >
                        (&Sigma; Batches)
                      </span>
                    </td>
                    <td>
                      <span data-testid={`material-batches-${mat.material_id}`}>
                        {mat.batch_count} Batches
                      </span>
                    </td>
                    <td>
                      <button
                        data-testid={`view-material-btn-${mat.material_id}`}
                        className="btn-ghost"
                        onClick={() =>
                          navigate(
                            `/materials/${mat.material_id}?account_id=${accountId}`
                          )
                        }
                        title="View Material in this Account"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ width: 14, height: 14 }}
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        View Material in this Account
                      </button>
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

function formatQuantity(value: number): string {
  const num = Number(value);
  if (Number.isInteger(num)) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}
