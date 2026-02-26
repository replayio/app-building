interface MaterialsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

export function MaterialsPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
}: MaterialsPaginationProps) {
  if (totalItems <= 0) return null;

  return (
    <div
      className="pagination"
      data-testid="materials-pagination"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingTop: 16,
      }}
    >
      <button
        className="pagination-btn"
        data-testid="pagination-previous"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className={`pagination-btn ${page === currentPage ? "pagination-btn--active" : ""}`}
          data-testid={`pagination-page-${page}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-btn"
        data-testid="pagination-next"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>

      <span
        className="pagination-info"
        data-testid="pagination-showing"
      >
        Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of{" "}
        {totalItems} items
      </span>
    </div>
  );
}
