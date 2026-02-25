import React, { useState, useMemo } from "react";
import { formatCurrency } from "@shared/utils/currency";
import { NewTransactionModal } from "./NewTransactionModal";
import type { Transaction } from "../types";

type SortColumn = "date" | "description" | "account" | "type" | "amount";
type SortDirection = "asc" | "desc";

interface TransactionsTableProps {
  transactions: Transaction[];
  hasFilters: boolean;
  pageSize?: number;
}

const PAGE_SIZE_DEFAULT = 20;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPrimaryEntry(txn: Transaction) {
  if (!txn.entries || txn.entries.length === 0) return null;
  return txn.entries[0];
}

function getPrimaryAccountName(txn: Transaction): string {
  const entry = getPrimaryEntry(txn);
  return entry?.account_name ?? "—";
}

function getPrimaryEntryType(txn: Transaction): "debit" | "credit" {
  const entry = getPrimaryEntry(txn);
  return entry?.entry_type ?? "debit";
}

function getPrimaryAmount(txn: Transaction): number {
  const entry = getPrimaryEntry(txn);
  return entry?.amount ?? 0;
}

export function TransactionsTable({
  transactions,
  hasFilters,
  pageSize = PAGE_SIZE_DEFAULT,
}: TransactionsTableProps): React.ReactElement {
  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const sorted = useMemo(() => {
    const arr = [...transactions];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case "date":
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "description":
          cmp = a.description.localeCompare(b.description);
          break;
        case "account":
          cmp = getPrimaryAccountName(a).localeCompare(getPrimaryAccountName(b));
          break;
        case "type":
          cmp = getPrimaryEntryType(a).localeCompare(getPrimaryEntryType(b));
          break;
        case "amount":
          cmp = getPrimaryAmount(a) - getPrimaryAmount(b);
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [transactions, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = sorted.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when transactions change (e.g., filters applied)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  const renderSortArrow = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return (
      <span className="transactions-table-sort-arrow" aria-hidden="true">
        {sortDirection === "asc" ? " ↑" : " ↓"}
      </span>
    );
  };

  if (transactions.length === 0) {
    return (
      <div className="transactions-empty" data-testid="transactions-table-empty">
        {hasFilters
          ? "No transactions found matching your filters"
          : "No transactions found"}
      </div>
    );
  }

  return (
    <>
      <div className="transactions-table-wrapper" data-testid="transactions-table">
        <table className="data-table">
          <thead>
            <tr>
              <th
                className="transactions-table-sortable-header"
                data-testid="transactions-table-header-date"
                onClick={() => handleSort("date")}
              >
                <span className="transactions-table-sort-label">
                  Date{renderSortArrow("date")}
                </span>
              </th>
              <th
                className="transactions-table-sortable-header"
                data-testid="transactions-table-header-description"
                onClick={() => handleSort("description")}
              >
                <span className="transactions-table-sort-label">
                  Description{renderSortArrow("description")}
                </span>
              </th>
              <th
                className="transactions-table-sortable-header"
                data-testid="transactions-table-header-account"
                onClick={() => handleSort("account")}
              >
                <span className="transactions-table-sort-label">
                  Account{renderSortArrow("account")}
                </span>
              </th>
              <th
                className="transactions-table-sortable-header"
                data-testid="transactions-table-header-type"
                onClick={() => handleSort("type")}
              >
                <span className="transactions-table-sort-label">
                  Type{renderSortArrow("type")}
                </span>
              </th>
              <th
                className="transactions-table-sortable-header"
                data-testid="transactions-table-header-amount"
                onClick={() => handleSort("amount")}
              >
                <span className="transactions-table-sort-label">
                  Amount{renderSortArrow("amount")}
                </span>
              </th>
              <th data-testid="transactions-table-header-tags">Tags</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((txn) => {
              const entryType = getPrimaryEntryType(txn);
              const amount = getPrimaryAmount(txn);
              const accountName = getPrimaryAccountName(txn);

              return (
                <tr
                  key={txn.id}
                  data-testid={`transaction-row-${txn.id}`}
                  className="transactions-table-row"
                  onClick={() => setEditTransaction(txn)}
                >
                  <td>{formatDate(txn.date)}</td>
                  <td>{txn.description}</td>
                  <td>{accountName}</td>
                  <td>
                    <span
                      className={`transaction-direction transaction-direction--${entryType}`}
                      data-testid={`transaction-type-${txn.id}`}
                    >
                      {entryType === "debit" ? "Debit" : "Credit"}
                    </span>
                  </td>
                  <td className="transactions-table-amount">
                    {formatCurrency(amount)}
                  </td>
                  <td>
                    {txn.tags && txn.tags.length > 0 ? (
                      <div
                        className="transactions-table-tags"
                        data-testid={`transaction-tags-${txn.id}`}
                      >
                        {txn.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="tag"
                            data-testid={`transaction-tag-${txn.id}-${tag.name}`}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="transactions-table-no-tags">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={sorted.length}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {totalPages <= 1 && sorted.length > 0 && (
        <div className="transactions-pagination" data-testid="pagination">
          <span className="transactions-pagination-label">
            Page 1 of 1
          </span>
        </div>
      )}

      {editTransaction && (
        <NewTransactionModal
          onClose={() => setEditTransaction(null)}
          editTransaction={editTransaction}
        />
      )}
    </>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps): React.ReactElement {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  return (
    <div className="transactions-pagination" data-testid="pagination">
      <button
        className="transactions-pagination-btn"
        data-testid="pagination-prev"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9 3L5 7L9 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="transactions-pagination-pages" data-testid="pagination-pages">
        {pageNumbers.map((page) => (
          <button
            key={page}
            className={`transactions-pagination-page${page === currentPage ? " transactions-pagination-page--active" : ""}`}
            data-testid={`pagination-page-${page}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="transactions-pagination-btn"
        data-testid="pagination-next"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5 3L9 7L5 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <span className="transactions-pagination-label" data-testid="pagination-label">
        Showing {startItem}–{endItem} of {totalItems} transactions
      </span>
    </div>
  );
}
