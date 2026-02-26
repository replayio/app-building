import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Transaction } from "../types";

export type TransactionSortOption =
  | "date-desc"
  | "date-asc"
  | "id-desc"
  | "id-asc";

interface TransactionsTableProps {
  transactions: Transaction[];
  sortBy: TransactionSortOption;
  onSortChange: (sort: TransactionSortOption) => void;
  totalFiltered: number;
  startIndex: number;
  endIndex: number;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const dateOnly = dateStr.split("T")[0];
  const d = new Date(dateOnly + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatAccountsAffected(transaction: Transaction): string {
  if (!transaction.transfers || transaction.transfers.length === 0) return "N/A";

  const drAccounts = new Set<string>();
  const crAccounts = new Set<string>();
  for (const t of transaction.transfers) {
    if (t.destination_account_name) drAccounts.add(t.destination_account_name);
    if (t.source_account_name) crAccounts.add(t.source_account_name);
  }

  const parts: string[] = [];
  for (const name of drAccounts) {
    parts.push(`Dr: ${name}`);
  }
  for (const name of crAccounts) {
    parts.push(`Cr: ${name}`);
  }

  return parts.join(" | ");
}

function formatMaterialsAndAmounts(transaction: Transaction): string {
  if (!transaction.transfers || transaction.transfers.length === 0) return "N/A";

  const materialParts: string[] = [];
  for (const t of transaction.transfers) {
    if (t.material_name) {
      materialParts.push(`${t.material_name}: ${Number(t.amount)} ${t.unit}`);
    }
  }

  if (materialParts.length === 0) return "N/A";
  return materialParts.join("; ");
}

const SORT_OPTIONS: { value: TransactionSortOption; label: string }[] = [
  { value: "date-desc", label: "Date (Newest First)" },
  { value: "date-asc", label: "Date (Oldest First)" },
  { value: "id-desc", label: "Transaction ID (Z-A)" },
  { value: "id-asc", label: "Transaction ID (A-Z)" },
];

export function TransactionsTable({
  transactions,
  sortBy,
  onSortChange,
  totalFiltered,
  startIndex,
  endIndex,
}: TransactionsTableProps) {
  const navigate = useNavigate();
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    if (sortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [sortDropdownOpen]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "";

  const handleColumnSort = (column: "date" | "id") => {
    if (column === "date") {
      onSortChange(sortBy === "date-desc" ? "date-asc" : "date-desc");
    } else {
      onSortChange(sortBy === "id-asc" ? "id-desc" : "id-asc");
    }
  };

  const getSortIndicator = (column: "date" | "id") => {
    if (column === "date") {
      if (sortBy === "date-asc") return " \u2191";
      if (sortBy === "date-desc") return " \u2193";
    }
    if (column === "id") {
      if (sortBy === "id-asc") return " \u2191";
      if (sortBy === "id-desc") return " \u2193";
    }
    return "";
  };

  return (
    <div data-testid="transactions-table-container">
      {/* Sort bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <div ref={sortRef} style={{ position: "relative" }}>
          <button
            data-testid="transactions-sort-dropdown"
            className="custom-dropdown-trigger"
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            type="button"
          >
            <span>Sort by: {currentSortLabel}</span>
            <svg
              className={`custom-dropdown-chevron${sortDropdownOpen ? " custom-dropdown-chevron--open" : ""}`}
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {sortDropdownOpen && (
            <div className="custom-dropdown-menu" data-testid="transactions-sort-options" style={{ right: 0, left: "auto" }}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`custom-dropdown-item${opt.value === sortBy ? " custom-dropdown-item--selected" : ""}`}
                  data-testid={`sort-option-${opt.value}`}
                  onClick={() => {
                    onSortChange(opt.value);
                    setSortDropdownOpen(false);
                  }}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="pagination-info" data-testid="transactions-result-count">
          Showing {totalFiltered === 0 ? 0 : startIndex + 1}-{endIndex} of {totalFiltered} results
        </span>
      </div>

      {/* Table */}
      <table className="data-table" data-testid="transactions-table">
        <thead>
          <tr>
            <th>
              <button
                data-testid="sort-by-date"
                onClick={() => handleColumnSort("date")}
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit", padding: 0, fontWeight: 500 }}
              >
                Date{getSortIndicator("date")}
              </button>
            </th>
            <th>
              <button
                data-testid="sort-by-id"
                onClick={() => handleColumnSort("id")}
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit", padding: 0, fontWeight: 500 }}
              >
                Transaction ID{getSortIndicator("id")}
              </button>
            </th>
            <th>Description</th>
            <th>Accounts affected</th>
            <th>Materials and amounts</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className="empty-state" data-testid="transactions-empty-state">
                  <div className="empty-state-message">No transactions found</div>
                </div>
              </td>
            </tr>
          ) : (
            transactions.map((txn) => (
              <tr
                key={txn.id}
                className="clickable"
                data-testid={`transaction-row-${txn.id}`}
                onClick={() => navigate(`/transactions/${txn.id}`)}
              >
                <td data-testid={`transaction-date-${txn.id}`}>{formatDate(txn.date)}</td>
                <td data-testid={`transaction-ref-${txn.id}`}>{txn.reference_id || txn.id}</td>
                <td data-testid={`transaction-desc-${txn.id}`}>{txn.description}</td>
                <td data-testid={`transaction-accounts-${txn.id}`}>{formatAccountsAffected(txn)}</td>
                <td data-testid={`transaction-materials-${txn.id}`}>{formatMaterialsAndAmounts(txn)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
