import { Pagination } from "@shared/components/Pagination";

interface ClientsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function ClientsPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: ClientsPaginationProps) {
  if (totalCount === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="clients-pagination" data-testid="clients-pagination">
      <span className="clients-pagination-info" data-testid="pagination-range">
        Showing {start}-{end} of {totalCount} clients
      </span>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
