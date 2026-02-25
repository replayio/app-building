import { Pagination } from "@shared/components/Pagination";

interface ContactsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function ContactsPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: ContactsPaginationProps) {
  if (totalCount === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="contacts-pagination" data-testid="contacts-pagination">
      <span className="contacts-pagination-info" data-testid="pagination-range">
        Showing {start}-{end} of {totalCount} contacts
      </span>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
