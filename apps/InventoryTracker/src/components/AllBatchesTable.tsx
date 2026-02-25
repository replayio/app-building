import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FilterSelect } from "@shared/components/FilterSelect";
import type { Batch } from "../types";

interface AllBatchesTableProps {
  batches: Batch[];
  unitOfMeasure: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatQuantity(value: number): string {
  const num = Number(value);
  return num.toLocaleString("en-US");
}

function getDateRangeStart(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export function AllBatchesTable({
  batches,
  unitOfMeasure,
}: AllBatchesTableProps) {
  const navigate = useNavigate();
  const [accountFilter, setAccountFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Build account options from the batches data
  const accountOptions = useMemo(() => {
    const accountMap = new Map<string, string>();
    for (const b of batches) {
      if (b.account_id && b.account_name) {
        accountMap.set(b.account_id, b.account_name);
      }
    }
    const options = [{ value: "", label: "[All Accounts]" }];
    for (const [id, name] of accountMap) {
      options.push({ value: id, label: name });
    }
    return options;
  }, [batches]);

  const dateOptions = [
    { value: "", label: "[All Dates]" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
  ];

  const filteredBatches = useMemo(() => {
    let result = batches;

    if (accountFilter) {
      result = result.filter((b) => b.account_id === accountFilter);
    }

    if (dateFilter) {
      const rangeStart = getDateRangeStart(dateFilter);
      if (rangeStart) {
        result = result.filter(
          (b) => new Date(b.created_at) >= rangeStart
        );
      }
    }

    return result;
  }, [batches, accountFilter, dateFilter]);

  return (
    <div data-testid="all-batches-section">
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
            All Batches
          </h2>
        </div>
        <div className="section-card-body">
          <div className="filter-bar">
            <span className="filter-label">Filter by Account:</span>
            <FilterSelect
              options={accountOptions}
              value={accountFilter}
              onChange={setAccountFilter}
              placeholder="[All Accounts]"
              testId="filter-account"
            />
            <span className="filter-label">Filter by Date:</span>
            <FilterSelect
              options={dateOptions}
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="[All Dates]"
              testId="filter-date"
            />
          </div>

          {filteredBatches.length === 0 ? (
            <div data-testid="all-batches-empty" className="empty-state">
              <p className="empty-state-message">
                {batches.length === 0
                  ? "No batches found for this material"
                  : "No batches found"}
              </p>
            </div>
          ) : (
            <div style={{ padding: 0 }}>
              <table className="data-table" data-testid="all-batches-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Location</th>
                    <th>Quantity ({unitOfMeasure})</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => (
                    <tr
                      key={batch.id}
                      data-testid={`batch-row-${batch.id}`}
                    >
                      <td>
                        <a
                          data-testid={`batch-id-${batch.id}`}
                          className="link"
                          href={`/batches/${batch.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/batches/${batch.id}`);
                          }}
                        >
                          {batch.id.substring(0, 13)}
                        </a>
                      </td>
                      <td>
                        <span data-testid={`batch-location-${batch.id}`}>
                          {batch.account_name || batch.location || "—"}
                        </span>
                      </td>
                      <td>
                        <span data-testid={`batch-quantity-${batch.id}`}>
                          {formatQuantity(batch.quantity)}
                        </span>
                      </td>
                      <td>
                        <span data-testid={`batch-date-${batch.id}`}>
                          {formatDate(batch.created_at)}
                        </span>
                      </td>
                      <td>
                        <a
                          data-testid={`view-lineage-${batch.id}`}
                          className="link"
                          href={`/batches/${batch.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/batches/${batch.id}`);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
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
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          View Lineage
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
