import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FilterSelect } from "@shared/components/FilterSelect";
import type { Transaction } from "../types";

interface TransactionsHistoryTableProps {
  transactions: Transaction[];
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

export function TransactionsHistoryTable({
  transactions,
  unitOfMeasure,
}: TransactionsHistoryTableProps) {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("30d");

  const typeOptions = [
    { value: "", label: "[All Types]" },
    { value: "purchase", label: "Purchase" },
    { value: "consumption", label: "Consumption" },
    { value: "transfer", label: "Transfer" },
    { value: "production", label: "Production" },
    { value: "adjustment", label: "Adjustment" },
  ];

  const dateOptions = [
    { value: "7d", label: "[Last 7 Days]" },
    { value: "30d", label: "[Last 30 Days]" },
    { value: "90d", label: "[Last 90 Days]" },
    { value: "", label: "[All Time]" },
  ];

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (typeFilter) {
      result = result.filter((t) => t.transaction_type === typeFilter);
    }

    if (dateFilter) {
      const rangeStart = getDateRangeStart(dateFilter);
      if (rangeStart) {
        result = result.filter(
          (t) => new Date(t.date) >= rangeStart
        );
      }
    }

    // Sort by date descending (most recent first)
    result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return result;
  }, [transactions, typeFilter, dateFilter]);

  // Build summary info for each transaction from its transfers
  const getAccountsInvolved = (t: Transaction): string => {
    if (!t.transfers || t.transfers.length === 0) return "—";
    const sources = new Set<string>();
    const destinations = new Set<string>();
    for (const tr of t.transfers) {
      if (tr.source_account_name) sources.add(tr.source_account_name);
      if (tr.destination_account_name)
        destinations.add(tr.destination_account_name);
    }
    const srcStr = Array.from(sources).join(", ");
    const destStr = Array.from(destinations).join(", ");
    if (srcStr && destStr) return `${srcStr} → ${destStr}`;
    if (srcStr) return srcStr;
    if (destStr) return destStr;
    return "—";
  };

  const getBatchReferences = (
    t: Transaction
  ): { id: string; label: string }[] => {
    const refs: { id: string; label: string }[] = [];
    if (t.transfers) {
      for (const tr of t.transfers) {
        if (tr.source_batch_id) {
          refs.push({
            id: tr.source_batch_id,
            label: tr.source_batch_label || tr.source_batch_id.substring(0, 13),
          });
        }
      }
    }
    if (t.batches_created) {
      for (const bc of t.batches_created) {
        if (bc.batch_id) {
          refs.push({
            id: bc.batch_id,
            label: bc.batch_id.substring(0, 13),
          });
        }
      }
    }
    // Deduplicate by id
    const seen = new Set<string>();
    return refs.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  };

  const getQuantityMoved = (t: Transaction): number => {
    if (!t.transfers || t.transfers.length === 0) return 0;
    return t.transfers.reduce((sum, tr) => sum + Number(tr.amount), 0);
  };

  return (
    <div data-testid="transactions-history-section">
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
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            Transactions History
          </h2>
        </div>
        <div className="section-card-body">
          <div className="filter-bar">
            <span className="filter-label">Filter by Type:</span>
            <FilterSelect
              options={typeOptions}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="[All Types]"
              testId="filter-type"
            />
            <span className="filter-label">Filter by Date:</span>
            <FilterSelect
              options={dateOptions}
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="[Last 30 Days]"
              testId="filter-txn-date"
            />
          </div>

          {filteredTransactions.length === 0 ? (
            <div
              data-testid="transactions-history-empty"
              className="empty-state"
            >
              <p className="empty-state-message">
                {transactions.length === 0
                  ? "No transactions found for this material"
                  : "No transactions found"}
              </p>
            </div>
          ) : (
            <div style={{ padding: 0 }}>
              <table
                className="data-table"
                data-testid="transactions-history-table"
              >
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th className="max-lg:hidden">Accounts Involved</th>
                    <th className="max-md:hidden">Batch References</th>
                    <th>Quantity Moved ({unitOfMeasure})</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => {
                    const batchRefs = getBatchReferences(txn);
                    return (
                      <tr
                        key={txn.id}
                        data-testid={`transaction-row-${txn.id}`}
                      >
                        <td>
                          <span data-testid={`txn-date-${txn.id}`}>
                            {formatDate(txn.date)}
                          </span>
                        </td>
                        <td>
                          <a
                            data-testid={`txn-id-${txn.id}`}
                            className="link"
                            href={`/transactions/${txn.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/transactions/${txn.id}`);
                            }}
                          >
                            {txn.reference_id || txn.id.substring(0, 13)}
                          </a>
                        </td>
                        <td className="max-lg:hidden">
                          <span data-testid={`txn-accounts-${txn.id}`}>
                            {getAccountsInvolved(txn)}
                          </span>
                        </td>
                        <td className="max-md:hidden">
                          <span data-testid={`txn-batches-${txn.id}`}>
                            {batchRefs.length === 0
                              ? "—"
                              : batchRefs.map((ref, i) => (
                                  <span key={ref.id}>
                                    {i > 0 && ", "}
                                    <a
                                      data-testid={`batch-ref-link-${ref.id}`}
                                      className="link"
                                      href={`/batches/${ref.id}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/batches/${ref.id}`);
                                      }}
                                    >
                                      {ref.label}
                                    </a>
                                  </span>
                                ))}
                          </span>
                        </td>
                        <td>
                          <span data-testid={`txn-quantity-${txn.id}`}>
                            {formatQuantity(getQuantityMoved(txn))}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
