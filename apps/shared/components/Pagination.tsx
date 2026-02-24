import React from "react";
import "./Pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps): React.ReactElement {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="pagination" data-testid="pagination">
      <button
        className="btn btn--ghost pagination-btn"
        data-testid="pagination-first"
        disabled={isFirstPage}
        onClick={() => onPageChange(1)}
        aria-label="First page"
      >
        &laquo;
      </button>
      <button
        className="btn btn--ghost pagination-btn"
        data-testid="pagination-prev"
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        &lsaquo;
      </button>
      <span className="pagination-info" data-testid="pagination-info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="btn btn--ghost pagination-btn"
        data-testid="pagination-next"
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        &rsaquo;
      </button>
      <button
        className="btn btn--ghost pagination-btn"
        data-testid="pagination-last"
        disabled={isLastPage}
        onClick={() => onPageChange(totalPages)}
        aria-label="Last page"
      >
        &raquo;
      </button>
    </div>
  );
}
