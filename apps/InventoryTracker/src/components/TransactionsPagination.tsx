import { useState, useRef, useEffect } from "react";

interface TransactionsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

const ROWS_OPTIONS = [10, 25, 50];

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  if (currentPage <= 3) {
    pages.push(1, 2, 3, "ellipsis", totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, "ellipsis", totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
  }

  return pages;
}

export function TransactionsPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TransactionsPaginationProps) {
  const [rowsDropdownOpen, setRowsDropdownOpen] = useState(false);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rowsRef.current && !rowsRef.current.contains(e.target as Node)) {
        setRowsDropdownOpen(false);
      }
    }
    if (rowsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [rowsDropdownOpen]);

  if (totalItems <= 0) return null;

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div
      data-testid="transactions-pagination"
      className="pagination"
      style={{ justifyContent: "space-between", flexWrap: "wrap" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          data-testid="pagination-first"
          className="pagination-btn"
          disabled={isFirstPage}
          onClick={() => onPageChange(1)}
          type="button"
        >
          First
        </button>
        <button
          data-testid="pagination-previous"
          className="pagination-btn"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Previous
        </button>

        {pageNumbers.map((item, idx) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="pagination-btn" style={{ cursor: "default" }} data-testid="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={item}
              className={`pagination-btn${item === currentPage ? " pagination-btn--active" : ""}`}
              data-testid={`pagination-page-${item}`}
              onClick={() => onPageChange(item)}
              type="button"
            >
              {item}
            </button>
          )
        )}

        <button
          data-testid="pagination-next"
          className="pagination-btn"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
        <button
          data-testid="pagination-last"
          className="pagination-btn"
          disabled={isLastPage}
          onClick={() => onPageChange(totalPages)}
          type="button"
        >
          Last
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="pagination-info" data-testid="pagination-showing">
          Showing {startIndex + 1}-{endIndex} of {totalItems} results
        </span>
        <div ref={rowsRef} style={{ position: "relative", display: "inline-block" }}>
          <span className="filter-label" style={{ marginRight: 4 }}>Rows per page:</span>
          <button
            data-testid="rows-per-page-trigger"
            className="custom-dropdown-trigger"
            onClick={() => setRowsDropdownOpen(!rowsDropdownOpen)}
            type="button"
            style={{ minWidth: 50 }}
          >
            <span>{rowsPerPage}</span>
            <svg
              className={`custom-dropdown-chevron${rowsDropdownOpen ? " custom-dropdown-chevron--open" : ""}`}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {rowsDropdownOpen && (
            <div className="custom-dropdown-menu" data-testid="rows-per-page-dropdown" style={{ right: 0, left: "auto", minWidth: 60 }}>
              {ROWS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`custom-dropdown-item${opt === rowsPerPage ? " custom-dropdown-item--selected" : ""}`}
                  data-testid={`rows-per-page-option-${opt}`}
                  onClick={() => {
                    onRowsPerPageChange(opt);
                    setRowsDropdownOpen(false);
                  }}
                  type="button"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
