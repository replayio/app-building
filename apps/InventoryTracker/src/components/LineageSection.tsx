import { useNavigate } from "react-router-dom";
import type { Batch, BatchLineage } from "../types";

interface LineageSectionProps {
  batch: Batch;
  lineage: BatchLineage[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ArrowRight() {
  return (
    <div className="lineage-arrow" style={{ display: "flex", alignItems: "center" }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 24, height: 24 }}
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </div>
  );
}

export function LineageSection({ batch, lineage }: LineageSectionProps) {
  const navigate = useNavigate();

  const hasLineage = lineage.length > 0 && batch.originating_transaction_id;

  return (
    <div data-testid="lineage-section">
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
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            Lineage
          </h2>
        </div>
        <div className="section-card-body">
          {!hasLineage ? (
            <div data-testid="lineage-empty" className="empty-state">
              <div className="empty-state-message">
                {batch.originating_transaction_id
                  ? "No lineage information available"
                  : "This batch was created directly — no source transaction"}
              </div>
            </div>
          ) : (
            <>
              <div
                data-testid="lineage-source-transaction"
                style={{ marginBottom: 16, fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}
              >
                Source Transaction:{" "}
                <a
                  className="link"
                  data-testid="lineage-transaction-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/transactions/${batch.originating_transaction_id}`);
                  }}
                  href={`/transactions/${batch.originating_transaction_id}`}
                >
                  {batch.originating_transaction_id!}
                </a>
              </div>

              {/* Inputs Used */}
              <div data-testid="lineage-inputs" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginBottom: 8,
                  }}
                >
                  Inputs Used:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {lineage.map((entry) => (
                    <div
                      key={entry.id}
                      data-testid={`lineage-input-${entry.source_batch_id}`}
                      className="lineage-node"
                    >
                      <a
                        className="link"
                        data-testid={`lineage-input-link-${entry.source_batch_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/batches/${entry.source_batch_id}`);
                        }}
                        href={`/batches/${entry.source_batch_id}`}
                        style={{ fontWeight: 500 }}
                      >
                        {entry.source_batch_id}
                      </a>
                      <div className="lineage-node-content" style={{ marginTop: 4 }}>
                        <div>Material: {entry.source_material_name || "—"}</div>
                        <div>
                          Quantity:{" "}
                          {Number(entry.quantity_used).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {entry.unit}
                        </div>
                        <div>Account: {entry.source_account_name || "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flow diagram */}
              <div data-testid="lineage-flow-diagram" className="lineage-diagram">
                {/* Input nodes */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {lineage.map((entry) => (
                    <div key={entry.id} className="lineage-node" style={{ minWidth: 160 }}>
                      <div className="lineage-node-title">Input</div>
                      <a
                        className="link lineage-node-content"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/batches/${entry.source_batch_id}`);
                        }}
                        href={`/batches/${entry.source_batch_id}`}
                      >
                        {entry.source_batch_id}
                      </a>
                    </div>
                  ))}
                </div>

                <ArrowRight />

                {/* Transaction process box */}
                <div className="lineage-process">
                  <div className="lineage-process-title">
                    {batch.originating_transaction_id!}
                  </div>
                  <div className="lineage-process-date">
                    Date: {formatDate(batch.created_at)}
                  </div>
                </div>

                <ArrowRight />

                {/* Output node */}
                <div className="lineage-node" style={{ minWidth: 160 }}>
                  <div className="lineage-node-title">Output:</div>
                  <a
                    className="link lineage-node-content"
                    data-testid="lineage-output-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/batches/${batch.id}`);
                    }}
                    href={`/batches/${batch.id}`}
                    style={{ fontWeight: 500 }}
                  >
                    {batch.id}
                  </a>
                  <div className="lineage-node-content" style={{ marginTop: 4 }}>
                    <div>Material: {batch.material_name || "—"}</div>
                    <div>
                      Quantity:{" "}
                      {Number(batch.quantity).toLocaleString(undefined, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {batch.unit}
                    </div>
                    <div>Account: {batch.account_name || "—"}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
