import { Pagination } from "@shared/components/Pagination";

interface DealsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DealsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: DealsPaginationProps) {
  if (totalPages <= 0) return null;

  return (
    <div className="deals-pagination" data-testid="deals-pagination">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
