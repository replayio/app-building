import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import type { Batch } from "../types";

interface BatchHeaderProps {
  batch: Batch;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${year}-${month}-${day} at ${h}:${minutes} ${ampm}`;
}

function statusDotColor(status: string): string {
  switch (status) {
    case "active":
      return "var(--accent-primary)";
    case "depleted":
      return "var(--status-error)";
    case "expired":
      return "var(--status-warning)";
    default:
      return "var(--text-muted)";
  }
}

export function BatchHeader({ batch }: BatchHeaderProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="batch-header">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: "Batches", onClick: () => navigate("/batches") },
          { label: batch.id },
        ]}
      />

      <div className="page-header" style={{ marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <h1 data-testid="batch-id-heading" className="page-title">
            Batch: {batch.id}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <div data-testid="batch-material">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  display: "block",
                }}
              >
                Material
              </span>
              <a
                className="link"
                data-testid="batch-material-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/materials/${batch.material_id}`);
                }}
                href={`/materials/${batch.material_id}`}
              >
                {batch.material_name || "—"}
              </a>
            </div>

            <div data-testid="batch-account">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  display: "block",
                }}
              >
                Account
              </span>
              <a
                className="link"
                data-testid="batch-account-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/accounts/${batch.account_id}`);
                }}
                href={`/accounts/${batch.account_id}`}
              >
                {batch.account_name || "—"}
              </a>
            </div>

            <div data-testid="batch-status">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  display: "block",
                }}
              >
                Status
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 450,
                  color: "var(--text-primary)",
                  marginTop: 2,
                }}
              >
                <span
                  data-testid="batch-status-dot"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: statusDotColor(batch.status),
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              data-testid="batch-created-date"
              className="badge badge--default"
            >
              Created: {formatDateTime(batch.created_at)}
            </span>

            {batch.originating_transaction_id && (
              <span
                data-testid="batch-originating-transaction"
                className="badge badge--default"
              >
                Originating Transaction:{" "}
                <a
                  className="link"
                  data-testid="originating-transaction-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(
                      `/transactions/${batch.originating_transaction_id}`
                    );
                  }}
                  href={`/transactions/${batch.originating_transaction_id}`}
                  style={{ fontSize: 11 }}
                >
                  {batch.originating_transaction_id}
                </a>
              </span>
            )}
          </div>
        </div>

        <div className="page-header-actions">
          <button
            data-testid="create-new-transaction-btn"
            className="btn-primary"
            onClick={() =>
              navigate(
                `/transactions/new?batch_id=${batch.id}&material_id=${batch.material_id}&account_id=${batch.account_id}`
              )
            }
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="max-sm:hidden">Create New Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
}
